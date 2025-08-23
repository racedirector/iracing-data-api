#include <string>
#include <time.h>
#include "../../lib/irsdk_defines.h"

class IRacingClient
{
public:
  IRacingClient();
  ~IRacingClient();

  bool start();
  void stop();

  bool isInitialized() const;
  bool isConnected() const;

  bool updateTelemetry();   // true if telemetry update available
  bool updateSessionInfo(); // true if session info update available

  const std::string getSessionInfo() const;

  const double getLastTelemetryUpdateTimestamp() const;

private:
  int m_lastTelemetryTick;
  int m_lastSessionInfoTick;

  time_t m_lastValidTime;
  std::string m_sessionInfoString;
};