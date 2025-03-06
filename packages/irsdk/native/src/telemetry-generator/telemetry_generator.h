#include <napi.h>

class TelemetryGenerator : public Napi::ObjectWrap<TelemetryGenerator>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  TelemetryGenerator(const Napi::CallbackInfo &info, int fps = 1);
  ~TelemetryGenerator()
  {
    StopExecution();
  }

private:
  int m_fps;

  std::thread m_workerThread;
  std::atomic<bool> m_running;
  Napi::ThreadSafeFunction m_tsfn;

  void Start(const Napi::CallbackInfo &info);
  void Stop(const Napi::CallbackInfo &info);
  void StopExecution();
}