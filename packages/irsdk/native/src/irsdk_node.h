#ifndef IRSDK_NODE_H
#define IRSDK_NODE_H

#include <napi.h>
#include "../lib/irsdk_defines.h"
#include "../lib/irsdk_client.h"

class irsdkNode : public Napi::ObjectWrap<irsdkNode>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  irsdkNode(const Napi::CallbackInfo &info);

private:
  // Properties

  /**
   * Whether logging is enabled
   */
  Napi::Value GetEnableLogging(const Napi::CallbackInfo &info);

  /**
   * Set logging enabled
   */
  void SetEnableLogging(const Napi::CallbackInfo &info, const Napi::Value &value);

  // Methods
  // Control

  /**
   * Start the telemetry stream
   */
  Napi::Value StartSdk(const Napi::CallbackInfo &info);

  /**
   * Stop the telemetry stream
   */
  Napi::Value StopSdk(const Napi::CallbackInfo &info);

  /**
   * Broadcast a message to the SDK
   */
  Napi::Value BroadcastMessage(const Napi::CallbackInfo &info);

  /**
   * Whether the SDK is running and connected
   */
  Napi::Value IsRunning(const Napi::CallbackInfo &info);

  // Not yet implemented
  Napi::Value WaitForData(const Napi::CallbackInfo &info);
  Napi::Value GetSessionData(const Napi::CallbackInfo &info);
  Napi::Value GetTelemetryData(const Napi::CallbackInfo &info);
  Napi::Value GetTelemetryVar(const Napi::CallbackInfo &info);

protected:
  /**
   * Logging enabled
   */
  bool _loggingEnabled;

  /**
   * Data buffer
   */
  char *m_data;

  /**
   * Data buffer length
   */
  int m_nData;

  /**
   * Status ID
   */
  int m_statusID;

  /**
   * Last emitted session count
   */
  int m_lastSessionCt;

  /**
   * Last session data tick
   */
  int m_lastTick;
};

#endif