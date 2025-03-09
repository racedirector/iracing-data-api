#include <napi.h>
#include "../../lib/irsdk_defines.h"
#include "../../lib/irsdk_client.h"
#include "./telemetry_generator.h"

Napi::Object TelemetryGenerator::Init(Napi::Env env, Napi::Object exports)
{
  Napi::Function func = DefineClass(env, "TelemetryGenerator", {InstanceMethod("start", &TelemetryGenerator::Start), InstanceMethod("stop", &TelemetryGenerator::Stop)});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("TelemetryGenerator", func);
  return exports;
}

TelemetryGenerator::TelemetryGenerator(const Napi::CallbackInfo &info) : Napi::ObjectWrap<TelemetryGenerator>(info), m_fps(1)
{
  Napi::Env env = info.Env();

  if (info.Length() < 1)
  {
    Napi::TypeError::New(env, "Expected a callback function").ThrowAsJavaScriptException();
    return;
  }

  if (!info[0].IsNumber())
  {
    Napi::TypeError::New(env, "Expected an argument for `fps`.").ThrowAsJavaScriptException();
    return;
  }

  m_fps = info[0].As<Napi::Number>().Int32Value();
  m_running.store(false);
}

void TelemetryGenerator::Start(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (m_running.load())
  {
    Napi::TypeError::New(env, "Telemetry generator is already running").ThrowAsJavaScriptException();
    return;
  }

  Napi::Function callback = info[0].As<Napi::Function>();
  m_tsfn = Napi::ThreadSafeFunction::New(env, callback, "TelemetryData", 0, 1);

  m_running.store(true);

  m_workerThread = std::thread([this]()
                               {
    while (m_running.load()) {
      if (!irsdkClient::instance().waitForData()) {
        continue;
      }

      std::string telemetryData = "{}";

      m_tsfn.BlockingCall(new std::string(telemetryData), [](Napi::Env env, Napi::Function jsCallback, std::string *telemetryData)
                          {
        jsCallback.Call({Napi::String::New(env, *telemetryData)});
        delete telemetryData;
      });

      // sleep?
    } });
}

void TelemetryGenerator::Stop(const Napi::CallbackInfo &info)
{
  StopExecution();
}

void TelemetryGenerator::StopExecution()
{
  if (m_running.load())
  {
    m_running.store(false);
    if (m_workerThread.joinable())
    {
      m_workerThread.join();
    }
  }
}