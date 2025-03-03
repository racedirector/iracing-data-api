# Services

Services are implementations of select packages in the `packages` directory.

- `iracing-bridge`: A service that demonstrates the `sdk` package usage.
- `telemetry-server`: An implementation of the `sdk-server` package. Creates a server that listens for telemetry data from the iRacing SDK and forwards it to connected clients. Meant to be used in conjunction with `examples/telemetry-client`.
