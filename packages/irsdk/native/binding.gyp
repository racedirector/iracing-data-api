{
  "targets": [
    {
      "target_name": "irsdk",
      "sources": [
        "src/binding.cpp",
        "src/lib/irsdk_node.cpp",
        "src/telemetry-emitter/telemetry_emitter.cpp",
        "src/session-emitter/session_emitter.cpp",
        "src/session-worker/session_worker.cpp",
        "lib/irsdk_client.cpp",
        "lib/irsdk_utils.cpp",
        "lib/yaml_parser.cpp",
        "lib/irsdk_defines.h"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
      ]
    }
  ]
}
