#include <napi.h>
#include "./telemetry_generator.h"

static Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  Napi::Function func = DefineClass(env, 'TelemetryGenerator', {TelemetryGenerator::InstanceMethod("start", &TelemetryGenerator::Start), TelemetryGenerator::InstanceMethod("stop", &TelemetryGenerator::Stop)});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set('TelemetryGenerator', func);
  return exports;
}

TelemetryGenerator::TelemetryGenerator(const Napi::CallbackInfo &info, int fps) : Napi::ObjectWrap<TelemetryGenerator>(info), m_running(false), m_fps(fps)
{
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
  m_tsfn = Napi::ThreadSafeFunction::New(env, callback, 'TelemetryData', 0, 1);

  m_running.store(true);

  m_workerThread = std::thread([this]()
                               {
    while (m_running.load()) {
      if (!irsdkClient::instance().waitForData(m_timeout)) {
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