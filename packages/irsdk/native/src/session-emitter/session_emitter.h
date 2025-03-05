#ifndef SESSION_EVENT_EMITTER_H
#define SESSION_EVENT_EMITTER_H

#include <napi.h>

class SessionEventEmitter : public Napi::ObjectWrap<SessionEventEmitter>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  SessionEventEmitter(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  Napi::Value Start(const Napi::CallbackInfo &info);
  Napi::Value Stop(const Napi::CallbackInfo &info);
}

#endif