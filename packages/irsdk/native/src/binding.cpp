#include <napi.h>
#include "./lib/irsdk_node.h"
#include "./session-emitter/session_emitter.h"
#include "./telemetry-emitter/telemetry_emitter.h"

/**
 * Module registration
 */
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  irsdkNode::Init(env, exports);
  SessionEventEmitter::Init(env, exports);
  TelemetryEventEmitter::Init(env, exports);
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);