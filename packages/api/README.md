# @iracing-data/api

An implementation for the iRacing `/data` API. Written in TypeScript, powered by Axios.

## Installation

_Coming Soon_

## Usage

_Coming Soon_

## Contributing

### Adding new API endpoints

[docs](./src/api/README.md)

### Adding implementation to the client

Add the new route to the client, defined in the `src/` root:

```typescript
export class IRacingAPIClient {
  // ... existing implementation

  // Add the new route for easy access for consumers
  async newResourceEndpoint() {
    // Execute the network request
    const response = await this.api.data.new.resourceEndpoint();

    // !!!: Error handling if appropriate
    // In most cases, this is irrelevant, but if you want to provide
    // some context to the error, you can do so here.
    if (response.status !== 200) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    // Use the helper function the fetch the JSON from the provided link
    return fetchValidLinkData(response.data);
  }

  // Or, if your endpoint takes parameters...
  async newResourceEndpointWithParameters(
    input: Parameters<IRacingAPI['data']['new']['resourceEndpoint']>[0] // Typescript annotation to forward the parameters from the function definition
  ) {
    const response = await this.api.data.new.resourceEndpoint(input);

    // ...same as above
  }

}
```