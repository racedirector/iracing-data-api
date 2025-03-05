#include <chrono>
#include <thread>
#include <iostream>

#include "session_emitter.h"

Napi::FunctionReference SessionEventEmitter::constructor;

Napi::Object SessionEventEmitter::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "SessionEmitter", {InstanceMethod("start", &SessionEmitter::Start), InstanceMethod("stop", &SessionEmitter::Stop)});

  constructor = Napi::Persistent(func);

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

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  SessionEventEmitter::Init(env, exports);
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)