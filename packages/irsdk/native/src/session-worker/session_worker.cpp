#include <napi.h>
#include "../../lib/irsdk_defines.h"
#include "../../lib/irsdk_client.h"
#include "./session_worker.h"

SessionWorker::SessionWorker(Napi::Env &env, int timeout = 16, bool retry = false)
    : Napi::AsyncWorker(env, "SessionWorker"), m_deferred(env), m_sessionString(NULL), m_timeout(timeout), m_retry(retry) {}

void SessionWorker::Execute()
{
  // Wait for data...
  if (irsdkClient::instance().waitForData(m_timeout))
  {
    // While there's no session string update...
    while (!irsdkClient::instance().wasSessionStrUpdated())
    {
      // Check if we're connected to the sim and should retry...
      if (irsdk_isConnected() && m_retry)
      {
        // Wait for the data to update
        irsdkClient::instance().waitForData(m_timeout);
      }
      else
      {
        // bail
        SetError("Not connected to iRacing.");
        return;
      }
    }

    // Get the session string
    m_sessionString = irsdkClient::instance().getSessionStr();
  }
  else
  {
    SetError("Could not connect to iRacing.");
  }
}

void SessionWorker::OnOK()
{
  // Resolve with the session string.
  m_deferred.Resolve(Napi::String::New(Env(), m_sessionString));
}

void SessionWorker::OnError(const Napi::Error &e)
{
  // Reject with the error message.
  m_deferred.Reject(e.Value());
}