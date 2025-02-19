# API Module Documentation

## Overview

Supported routes are defined in the subdirectories. Each subdirectory represents an API provided by iRacing.

i.e. `data` represents the `/data` route. `data/car` represents the `/data/car` route. The root (this directory) represents the `/` route.

## Adding a route

To add a new route, navigate to the appropriate subdirectory and edit the `index.ts` file, or create a new subdirectory.

### Example: New route to existing resource

To add a new route `/data/track`, edit the existing `TrackAPI` class in `index.ts` in `./data/track`.
Add a function that represents the request to the endpoint.

```typescript
export class TrackAPI extends NetworkClientProvider {
  // ... existing implementation

  newRoute() {
    return this.client.get<IRacingAPIResponse>("/data/track/newRoute");
  }
}
```

### Example: New route with new resource

Create a new subdirectory in the appropriate directory and add an `index.ts` file. Define a new class that represents the API resource
and extends `NetworkClientProvider` to get access to the Axios client.

```typescript
export class NewAPI extends NetworkClientProvider {
  resourceEndpoint() {
    return this.client.get<IRacingAPIResponse>("/new/route");
  }
}
```

Add the API class to the parent class, if appropriate. In this example, let's consider that `/new` is a new resource under the `data` resource. Add the new class to the `DataAPI` class:

```typescript
// ... Existing import
import { NewAPI } from './new';

export class DataAPI extends NetworkClientProvider {
  // ... existing implementation
  private _new: NewAPI;
  get new() {
    return this._new;
  }

  constructor(client: AxiosInstance) {
    // ... existing initialization
    this._new = new NewAPI(client);
  }
}
```
