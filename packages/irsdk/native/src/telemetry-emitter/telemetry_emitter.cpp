#include <chrono>
#include <thread>
#include <iostream>

#include "telemetry_emitter.h"

Napi::FunctionReference TelemetryEventEmitter::constructor;

Napi::Object TelemetryEventEmitter::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "TelemetryEmitter", {InstanceMethod("CallAndEmit", &TelemetryEmitter::CallAndEmit)});

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("TelemetryEmitter", func);
  return exports;
}

TelemetryEventEmitter::TelemetryEventEmitter(const Napi::CallbackInfo &info) : Napi::ObjectWrap<TelemetryEventEmitter>(info)
{
}

Napi::Value TelemetryEventEmitter::Start(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "TelemetryEventEmitter::Start" << std::endl;

  return env.Undefined();
}

Napi::Value TelemetryEventEmitter::Stop(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "TelemetryEventEmitter::Stop" << std::endl;

  return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  TelemetryEventEmitter::Init(env, exports);
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)