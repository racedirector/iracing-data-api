# @iracing-data/irsdk-node

This package provides a Node.js interface to the iRacing SDK. It is a wrapper around the iRacing SDK shared memory interface, and provides a simple way to read telemetry data from the iRacing simulator.

## Classes

### IRacingSDK

Provides access to the iRacing SDK shared memory interface. Provides direct access to the shared memory data.

```ts
const irsdk = new IRacingSDK();

// Start the iRacing connection if it's not already running
irsdk.connect();

// Wait for the sim to start running and telemetry to connect
await irsdk.simConnected;
console.log("Connected to iRacing");

// While the sim is not disconnected...
const previousSessionTime = -1;

while (!irsdk.simDisconnected) {
  // Wait for the next telemetry update 2 fps
  await irsdk.waitForData(500);

  // Read data from the shared memory
  const nextSessionTime = irsdk.getVariable("SessionTime");

  if (nextSessionTime !== previousSessionTime) {
    console.log("SessionTime:", nextSessionTime);
    previousSessionTime = nextSessionTime;
  }
}

console.log("Disconnected from iRacing");
```

### TelemetryObserver

```ts
const telemetry = new TelemetryObserver({
  fps: 10,
  telemetry: [
    "PlayerCarIdx",
    "SessionTick",
    "CarIdxLastLapTime",
    "CarIdxBestLapTime",
    "CarIdxBestLapNum",

    "CarIdxLastLapTime[PlayerCarIdx]",
    "CarIdxBestLapTime[0]",
  ],
  session: [
    // All drivers
    "DriverInfo",
    // Only the player car
    "DriverInfo:Drivers:[PlayerCarIdx]:DriverName",
    // Certain index of drivers
    "DriverInfo:Drivers:[0,1,2,3,4]:DriverName",
    // Specific index
    "DriverInfo:Drivers:0:DriverName",
  ]
});

// Session tick observer
const telemetry = new TelemetryObserver({
  fps: 10,
  telemetry: [
    "SessionTick",
    "SessionTime",
    "SessionNum",
  ],
  // Only update when the tick changes
  condition: (previous, current) => {
    return current.SessionTick !== previous.SessionTick;
  }
});

// TODO: Figure out how to get updates from the observer

// EventEmitter pattern
telemetry.on("change", (data) => {
  console.log("Telemetry change:", data);
}).start();

// TODO: Should we manually tick the update? Each property provided to initialization will
// map to a `TelemetryVariable`. We diff each variable? Only the one's that change?

// TODO: Callbacks or promises?

while (await telemetry.onChange()) {
  console.log("Telemetry change:", telemetry.data);
}


// TODO: Generators?
await telemetry.next();

```
