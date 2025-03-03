#include "./irsdk_node.h"
#include "../lib/yaml_parser.h"

// ---------------------------
// Constrcutors
// ---------------------------

/**
 * Singleton constructor???
 */
Napi::Object irsdkNode::Init(Napi::Env env, Napi::Object exports)
{
  Napi::Function func = DefineClass(env, "irsdkNode", {InstanceAccessor<&irsdkNode::GetEnableLogging, &irsdkNode::SetEnableLogging>("enableLogging"),
                                                       // Control
                                                       InstanceMethod("startSDK", &irsdkNode::StartSdk), InstanceMethod("stopSDK", &irsdkNode::StopSdk),
                                                       // Data Retrieval
                                                       InstanceMethod("waitForData", &irsdkNode::WaitForData), InstanceMethod("getSessionData", &irsdkNode::GetSessionData), InstanceMethod("getTelemetryData", &irsdkNode::GetTelemetryData), InstanceMethod("getTelemetryVariable", &irsdkNode::GetTelemetryVar),
                                                       // Functionality
                                                       InstanceMethod("broadcast", &irsdkNode::BroadcastMessage),
                                                       // State
                                                       InstanceMethod("isRunning", &irsdkNode::IsRunning)});

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
    : Napi::ObjectWrap<irsdkNode>(info), m_data(NULL), m_nData(0), m_statusID(0), m_lastSessionCt(-1), m_lastTick(-1), _loggingEnabled(false)
{
  // If logging enabled, log that we're initializing the class
  if (_loggingEnabled)
    printf("Initializing cpp class instance...\n");
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

/**
 * Starts the SDK.
 *
 * If an SDK instance is not running, this method will start it and return
 * the result of `irsdk_startup()`. If an SDK instance is already running,
 * this method will return `true`.
 */
Napi::Value irsdkNode::StartSdk(const Napi::CallbackInfo &info)
{
  if (!irsdk_isConnected())
  {
    bool result = irsdk_startup();
    if (_loggingEnabled)
    {
      printf("Startup result: %i\n", result);
    }

    return Napi::Boolean::New(info.Env(), result);
  }

  return Napi::Boolean::New(info.Env(), true);
}

/**
 * Stops the SDK
 */
Napi::Value irsdkNode::StopSdk(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), false);
}

Napi::Value irsdkNode::WaitForData(const Napi::CallbackInfo &info)
{
  // Read the timeout from the info or default to 1000
  int timeout = 1000;
  if (info.Length() > 0 && info[0].IsNumber())
  {
    timeout = info[0].As<Napi::Number>().Int32Value();
  }

  // Wait for data and return the result
  bool result = irsdkClient::instance().waitForData(timeout);
  return Napi::Boolean::New(info.Env(), result);
}

Napi::Value irsdkNode::HasSessionInfoUpdate(const Napi::CallbackInfo &info)
{
  return Napi::Boolean::New(info.Env(), irsdkClient::instance().wasSessionStrUpdated());
}

Napi::Value irsdkNode::GetSessionData(const Napi::CallbackInfo &info)
{
  const char *session = irsdkClient::instance().getSessionInfoStr();
  return Napi::String::New(info.Env(), session);
}

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

/**
 * Returns whether the SDK is running
 */
Napi::Value irsdkNode::IsRunning(const Napi::CallbackInfo &info)
{
  bool sdkConnected = irsdk_isConnected();
  // TODO: Check if we have data
  return Napi::Boolean::New(info.Env(), sdkConnected);
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
  irsdkNode::Init(env, exports);
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll);