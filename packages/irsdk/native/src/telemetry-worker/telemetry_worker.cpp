#include <napi.h>
#include "../../lib/irsdk_defines.h"
#include "../../lib/irsdk_client.h"
#include "./telemetry_worker.h"

TelemetryWorker::TelemetryWorker(Napi::Env &env, int timeout = 16)
    : Napi::AsyncWorker(env, "TelemetryWorker"), m_deferred(env), m_telemetryData(NULL), m_timeout(timeout) {}

void TelemetryWorker::Execute()
{
  if (irsdk_waitForDataReady(m_timeout, m_telemetryData))
  {
    // Do nothing, the data is read into the buffer
  }
  else
  {
    SetError("Could not connect to iRacing.");
  }
}

void TelemetryWorker::OnOK()
{
  // Convert m_telemetryData into a JSON object and send to JS
  m_deferred.Resolve(Napi::String::New(Env(), m_telemetryData));
}

void TelemetryWorker::OnError(const Napi::Error &e)
{
  m_deferred.Reject(e.Value());
}