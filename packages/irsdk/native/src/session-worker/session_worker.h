#include <napi.h>

class SessionWorker : public Napi::AsyncWorker
{
public:
  SessionWorker(Napi::Env &env, int timeout);

  Napi::Promise GetPromise() { return m_deferred.Promise(); }

  void Execute() override;
  void OnOK() override;
  void OnError(const Napi::Error &e) override;

private:
  const char *m_sessionString;
  int m_timeout;
  bool m_retry = false;
  Napi::Promise::Deferred m_deferred;
};