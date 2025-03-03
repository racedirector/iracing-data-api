# examples/telemetry-client

This is a simple example of a client that connects to the `telemetry-server` service and prints the telemetry data to the console.

## Overview

Creates a WebSocket client that connects to the `telemetry-server` service.

## Usage

0. Update and load your environment. An `.env.template` is provided. Copy it to `.env` and update the values as needed:

    ```bash
    cp .env.template .env
    ```

    ```bash
    # .env
    PORT=1234
    ```

1. Start the `telemetry-server` service. A convenience script is provided:

    ```bash
    pnpm start:server
    ```

2. Run the client:

    ```bash
    // From the `examples/telemetry-client` directory
    pnpm start
    ```
