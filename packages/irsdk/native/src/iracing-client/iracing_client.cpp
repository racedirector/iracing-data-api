#include <iostream>
#include "iracing_client.h"

// npm install --debug enables debug prints
#ifdef _DEBUG
#define debug(x) std::cout << x << std::endl;
#else
#define debug(x)
#endif

IRacingClient::IRacingClient() : m_sessionInfoString()
{
  debug("IRacingClient::init()");
}

IRacingClient::~IRacingClient()
{
  debug("IRacingClient::destroy()");
}

bool IRacingClient::start()
{
  debug("IRacingClient::start()");
  return true;
}

void IRacingClient::stop()
{
  debug("IRacingClient::stop()");
}

bool IRacingClient::isInitialized() const
{
  debug("IRacingClient::isInitialized()");
  return true;
}

bool IRacingClient::isConnected() const
{
  debug("IRacingClient::isConnected()");
  return true;
}

bool IRacingClient::updateTelemetry()
{
  debug("IRacingClient::updateTelemetry()");
  return false;
}

bool IRacingClient::updateSessionInfo()
{
  debug("IRacingClient::updateSessionInfo()");
  return false;
}

const std::string IRacingClient::getSessionInfo() const
{
  debug("IRacingClient::getSessionInfo()");
  return m_sessionInfoString;
}

const double IRacingClient::getLastTelemetryUpdateTimestamp() const
{
  debug("IRacingClient::getLastTelemetryUpdateTimestamp()");
  return 0.0;
}