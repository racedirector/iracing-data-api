#include <chrono>
#include <thread>
#include <iostream>

#include "./session_emitter.h"

Napi::Object SessionEventEmitter::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "SessionEmitter", {InstanceMethod("start", &SessionEventEmitter::Start), InstanceMethod("stop", &SessionEventEmitter::Stop)});

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  env.SetInstanceData(constructor);

  exports.Set("SessionEmitter", func);
  return exports;
}

SessionEventEmitter::SessionEventEmitter(const Napi::CallbackInfo &info) : Napi::ObjectWrap<SessionEventEmitter>(info)
{
}

Napi::Value SessionEventEmitter::Start(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "SessionEventEmitter::Start" << std::endl;

  return env.Undefined();
}

Napi::Value SessionEventEmitter::Stop(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "SessionEventEmitter::Stop" << std::endl;

  return env.Undefined();
}