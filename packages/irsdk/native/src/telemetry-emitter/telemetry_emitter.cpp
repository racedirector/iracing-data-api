#include <chrono>
#include <thread>
#include <iostream>

#include "./telemetry_emitter.h"

Napi::Object TelemetryEventEmitter::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "TelemetryEmitter", {InstanceMethod("start", &TelemetryEventEmitter::Start), InstanceMethod("stop", &TelemetryEventEmitter::Stop)});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

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