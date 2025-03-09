#include <napi.h>

class TelemetryWorker : public Napi::AsyncWorker
{
public:
  TelemetryWorker(Napi::Env &env, int timeout);

  Napi::Promise GetPromise() { return m_deferred.Promise(); }

  void Execute() override;
  void OnOK() override;
  void OnError(const Napi::Error &e) override;

private:
  char *m_telemetryData;
  int m_timeout;
  Napi::Promise::Deferred m_deferred;
};