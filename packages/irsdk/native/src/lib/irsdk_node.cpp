#include <iostream>
#include "./irsdk_node.h"
#include "../session-worker/session_worker.h"
#include "../../lib/yaml_parser.h"

// ---------------------------
// Constrcutors
// ---------------------------

/**
 * Singleton constructor???
 */
Napi::Object irsdkNode::Init(Napi::Env env, Napi::Object exports)
{
  Napi::Function func = DefineClass(env, "irsdkNode", {
                                                          InstanceAccessor<&irsdkNode::GetEnableLogging, &irsdkNode::SetEnableLogging>("enableLogging"),
                                                          InstanceMethod("waitForData", &irsdkNode::WaitForData),
                                                          InstanceMethod("waitForDataAsync", &irsdkNode::WaitForDataAsync),
                                                          InstanceMethod("waitForSessionDataUpdate", &irsdkNode::WaitForSessionDataUpdate),
                                                      });

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("irsdkNode", func);
  return exports;
}

/**
 * Instance constructor
 */
irsdkNode::irsdkNode(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<irsdkNode>(info), _loggingEnabled(false)
{
}

// ---------------------------
// Properties
// ---------------------------

/**
 * Returns the current value of the logging enabled property
 */
Napi::Value irsdkNode::GetEnableLogging(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), this->_loggingEnabled);
}

/**
 * Sets the logging enabled property. Always logs a message of the next state.
 */
void irsdkNode::SetEnableLogging(const Napi::CallbackInfo &info, const Napi::Value &value)
{
  Napi::Boolean enable;
  if (info.Length() <= 0 || !info[0].IsBoolean())
  {
    enable = Napi::Boolean::New(info.Env(), false);
  }
  else
  {
    enable = info[0].As<Napi::Boolean>();
  }

  this->_loggingEnabled = enable;
}

// ---------------------------
// Methods
// ---------------------------

Napi::Value irsdkNode::WaitForData(const Napi::CallbackInfo &info)
{
  // Read the timeout from the info or default to 1000
  int timeout = 1000;
  if (info.Length() > 0 && info[0].IsNumber())
  {
    timeout = info[0].As<Napi::Number>().Int32Value();
  }

  // Wait for data and return the result
  return Napi::Boolean::New(info.Env(), irsdkClient::instance().waitForData(timeout));
}

Napi::Value irsdkNode::WaitForDataAsync(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(env);

  // Simulate an asynchronous operation
  std::thread([deferred, env]()
              {
      std::this_thread::sleep_for(std::chrono::seconds(2)); // Simulate work
  
      Napi::Boolean result = Napi::Boolean::New(env, true);
      deferred.Resolve(result); })
      .detach();

  return deferred.Promise();
}

Napi::Value irsdkNode::WaitForSessionDataUpdate(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  // Create a new session worker
  SessionWorker *worker = new SessionWorker(env);
  worker->Queue();
  return worker->GetPromise();
}

// --

/**
 * Direct bindings to the irsdkClient class
 */

// -- Session

Napi::Value irsdkNode::GetSessionCount(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), irsdkClient::instance().getSessionCt());
}

Napi::Value irsdkNode::HasSessionInfoUpdate(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), irsdkClient::instance().wasSessionStrUpdated());
}

Napi::Value irsdkNode::GetSessionStringValue(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 0 || !info[0].IsString())
  {
    return Napi::String::New(info.Env(), "");
  }

  std::string path = info[0].As<Napi::String>().Utf8Value();
  char val[256];
  int result = irsdkClient::instance().getSessionStrVal(path.c_str(), val, sizeof(val));
  if (result > 0)
  {
    return Napi::String::New(info.Env(), val);
  }

  return Napi::String::New(info.Env(), "");
}

Napi::Value irsdkNode::GetSessionString(const Napi::CallbackInfo &info)
{
  return Napi::String::New(info.Env(), irsdkClient::instance().getSessionStr());
}

// -- Telemetry

Napi::Value irsdkNode::GetTelemetryData(const Napi::CallbackInfo &info)
{
  return Napi::String::New(info.Env(), "");
}

Napi::Value irsdkNode::GetTelemetryVar(const Napi::CallbackInfo &info)
{
  return Napi::Object::New(info.Env());
}

/**
 * Broadcasts a message
 */
Napi::Value irsdkNode::BroadcastMessage(const Napi::CallbackInfo &info)
{
  auto env = info.Env();

  // Determine message type
  if (info.Length() <= 2 || !info[0].IsNumber())
  {
    return Napi::Boolean::New(env, false);
  }

  if (info.Length() == 4 && !info[2].IsNumber())
  {
    return Napi::Boolean::New(env, false);
  }

  int msgEnumIndex = info[0].As<Napi::Number>();
  irsdk_BroadcastMsg msgType = static_cast<irsdk_BroadcastMsg>(msgEnumIndex);

  // Args
  int arg1 = info[1].As<Napi::Number>();
  auto arg2 = info[2].As<Napi::Number>();
  auto arg3 = info[3].As<Napi::Number>();

  // these defs are in irsdk_defines.cpp
  switch (msgType)
  {
  // irsdk_BroadcastMsg msg, int arg1, int arg2, int var3
  case irsdk_BroadcastCamSwitchPos: // @todo we need to use irsdk_padCarNum for arg1
  case irsdk_BroadcastCamSwitchNum:
    printf("BroadcastMessage(msgType: %d, arg1: %d, arg2: %d, arg3: %d)\n", msgType, arg1, arg2.Int32Value(), arg3.Int32Value());
    irsdk_broadcastMsg(msgType, arg1, arg2, arg3);
    break;

  // irsdk_BroadcastMsg msg, int arg1, int unused, int unused
  case irsdk_BroadcastReplaySearch:   // arg1 == irsdk_RpySrchMode
  case irsdk_BroadcastReplaySetState: // arg1 == irsdk_RpyStateMode
  case irsdk_BroadcastCamSetState:    // arg1 == irsdk_CameraState
  case irsdk_BroadcastTelemCommand:   // arg1 == irsdk_TelemCommandMode
  case irsdk_BroadcastVideoCapture:   // arg1 == irsdk_VideoCaptureMode
    printf("BroadcastMessage(msgType: %d, arg1: %d, arg2: -1, arg3: -1)\n", msgType, arg1);
    irsdk_broadcastMsg(msgType, arg1, -1, -1);
    break;

  // irsdk_BroadcastMsg msg, int arg1, int arg2, int unused
  case irsdk_BroadcastReloadTextures: // arg1 == irsdk_ReloadTexturesMode
  case irsdk_BroadcastChatComand:     // arg1 == irsdk_ChatCommandMode
  case irsdk_BroadcastReplaySetPlaySpeed:
    printf("BroadcastMessage(msgType: %d, arg1: %d, arg2: %d, arg3: -1)\n", msgType, arg1, arg2.Int32Value());
    irsdk_broadcastMsg(msgType, arg1, arg2, -1);
    break;

  // irsdk_BroadcastMsg msg, int arg1, float arg2
  case irsdk_BroadcastPitCommand: // arg1 == irsdk_PitCommandMode
  case irsdk_BroadcastFFBCommand: // arg1 == irsdk_FFBCommandMode
  case irsdk_BroadcastReplaySearchSessionTime:
  case irskd_BroadcastReplaySetPlayPosition:
    printf("BroadcastMessage(msgType: %d, arg1: %d, arg2: %f)\n", msgType, arg1, (float)arg2.FloatValue());
    irsdk_broadcastMsg(msgType, arg1, (float)arg2.FloatValue());
    break;

  default:
    printf("Attempted to broadcast an unsupported message.");
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Value irsdkNode::IsConnected(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), irsdkClient::instance().isConnected());
}

Napi::Value irsdkNode::GetVarIdx(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 0 || !info[0].IsString())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  std::string varName = info[0].As<Napi::String>().Utf8Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarIdx(varName.c_str()));
}

Napi::Value irsdkNode::GetVarType(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 0 || !info[0].IsNumber())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarType(varIdx));
}

Napi::Value irsdkNode::GetVarCount(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 0 || !info[0].IsNumber())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarCount(varIdx));
}

Napi::Value irsdkNode::GetVarBool(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 1 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    return Napi::Boolean::New(info.Env(), false);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  int entry = info[1].As<Napi::Number>().Int32Value();
  return Napi::Boolean::New(info.Env(), irsdkClient::instance().getVarBool(varIdx, entry));
}

Napi::Value irsdkNode::GetVarInt(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 1 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  int entry = info[1].As<Napi::Number>().Int32Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarInt(varIdx, entry));
}

Napi::Value irsdkNode::GetVarFloat(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 1 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  int entry = info[1].As<Napi::Number>().Int32Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarFloat(varIdx, entry));
}

Napi::Value irsdkNode::GetVarDouble(const Napi::CallbackInfo &info)
{
  if (info.Length() <= 1 || !info[0].IsNumber() || !info[1].IsNumber())
  {
    return Napi::Number::New(info.Env(), -1);
  }

  int varIdx = info[0].As<Napi::Number>().Int32Value();
  int entry = info[1].As<Napi::Number>().Int32Value();
  return Napi::Number::New(info.Env(), irsdkClient::instance().getVarDouble(varIdx, entry));
}