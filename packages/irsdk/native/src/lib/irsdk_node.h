#ifndef IRSDK_NODE_H
#define IRSDK_NODE_H

#include <napi.h>

#include "../../lib/irsdk_defines.h"
#include "../../lib/irsdk_client.h"

class irsdkNode : public Napi::ObjectWrap<irsdkNode>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  irsdkNode(const Napi::CallbackInfo &info);

private:
  // Properties

  // Internal logging
  Napi::Value GetEnableLogging(const Napi::CallbackInfo &info);
  void SetEnableLogging(const Napi::CallbackInfo &info, const Napi::Value &value);

  Napi::Value BroadcastMessage(const Napi::CallbackInfo &info);

  // Telemetry data
  Napi::Value WaitForData(const Napi::CallbackInfo &info);
  Napi::Value WaitForDataAsync(const Napi::CallbackInfo &info);
  Napi::Value WaitForSessionDataUpdate(const Napi::CallbackInfo &info);

  // Connection state
  Napi::Value IsConnected(const Napi::CallbackInfo &info);

  // Session Info
  Napi::Value GetSessionCount(const Napi::CallbackInfo &info);
  Napi::Value HasSessionInfoUpdate(const Napi::CallbackInfo &info);
  Napi::Value GetSessionStringValue(const Napi::CallbackInfo &info);
  Napi::Value GetSessionString(const Napi::CallbackInfo &info);

  Napi::Value GetVarIdx(const Napi::CallbackInfo &info);
  Napi::Value GetVarType(const Napi::CallbackInfo &info);
  Napi::Value GetVarCount(const Napi::CallbackInfo &info);
  Napi::Value GetVarBool(const Napi::CallbackInfo &info);
  Napi::Value GetVarInt(const Napi::CallbackInfo &info);
  Napi::Value GetVarFloat(const Napi::CallbackInfo &info);
  Napi::Value GetVarDouble(const Napi::CallbackInfo &info);

  // Not yet implemented
  Napi::Value GetTelemetryData(const Napi::CallbackInfo &info);
  Napi::Value GetTelemetryVar(const Napi::CallbackInfo &info);

protected:
  /**
   * Logging enabled
   */
  bool _loggingEnabled;
};

#endif