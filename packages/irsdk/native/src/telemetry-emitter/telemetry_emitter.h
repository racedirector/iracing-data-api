#ifndef TELEMETRY_EVENT_EMITTER_H
#define TELEMETRY_EVENT_EMITTER_H

#include <napi.h>

class TelemetryEventEmitter : public Napi::ObjectWrap<TelemetryEventEmitter>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  TelemetryEventEmitter(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  Napi::Value Start(const Napi::CallbackInfo &info);
  Napi::Value Stop(const Napi::CallbackInfo &info);
}

#endif