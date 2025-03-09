#include <napi.h>
#include "./lib/irsdk_node.h"
#include "./telemetry-variable/telemetry_variable.h"
#include "./session-emitter/session_emitter.h"
#include "./telemetry-emitter/telemetry_emitter.h"
#include "./telemetry-generator/telemetry_generator.h"

/**
 * Module registration
 */
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  irsdkNode::Init(env, exports);
  TelemetryVariable::Init(env, exports);

  SessionEventEmitter::Init(env, exports);
  TelemetryEventEmitter::Init(env, exports);
  TelemetryGenerator::Init(env, exports);

  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);