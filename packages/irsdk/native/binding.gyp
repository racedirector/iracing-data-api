{
  "targets": [
    {
      "target_name": "irsdk",
      "sources": [
        "src/lib/irsdk_node.cpp",
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
    },
    {
      "target_name": "irsdk_telemetry-emitter",
      "sources": [
        "src/telemetry-emitter/telemetry-emitter.cpp",
        "lib/irsdk_utils.cpp",
        "lib/irsdk_defines.h"
      ],
      "defines": [
        "NAPI_DISABLE_CPP_EXCEPTIONS",
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include_dir\")",
      ]
    },
        {
      "target_name": "irsdk_session-emitter",
      "sources": [
        "src/session-emitter/session-emitter.cpp",
        "lib/irsdk_utils.cpp",
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
