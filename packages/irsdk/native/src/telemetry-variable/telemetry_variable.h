#ifndef TELEMETRY_VAR_H
#define TELEMETRY_VAR_H

#include <napi.h>
#include "../../lib/irsdk_defines.h"
#include "../../lib/irsdk_client.h"

class TelemetryVariable : public Napi::ObjectWrap<TelemetryVariable>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  TelemetryVariable(const Napi::CallbackInfo &info);
  ~TelemetryVariable()
  {
    delete m_var;
  }

private:
  // Backing class instance
  irsdkCVar *m_var;

  void SetName(const Napi::CallbackInfo &info);

  Napi::Value GetType(const Napi::CallbackInfo &info);
  Napi::Value GetCount(const Napi::CallbackInfo &info);
  Napi::Value IsValid(const Napi::CallbackInfo &info);

  Napi::Value GetBool(const Napi::CallbackInfo &info);
  Napi::Value GetInt(const Napi::CallbackInfo &info);
  Napi::Value GetFloat(const Napi::CallbackInfo &info);
  Napi::Value GetDouble(const Napi::CallbackInfo &info);
};

#endif // TELEMETRY_VAR_H