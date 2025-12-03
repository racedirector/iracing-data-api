import "@typespec/http";
import "@typespec/openapi3";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service({
  title: "iRacing `/data` API (TypeSpec)",
  version: "0.0.1",
})
@server("https://members-ng.iracing.com", "iRacing members data service")
@route("/data")
namespace IRacingDataApi {
  @doc("Headers included with every successful or rate-limited response.")
  model RateLimitHeaders {
    @header("x-ratelimit-limit")
    rateLimit?: int64;

    @header("x-ratelimit-remaining")
    remaining?: int64;

    @header("x-ratelimit-reset")
    resetAt?: int64;
  }

  @doc("Response returned for successful `/data` calls, pointing to cached data.")
  model DataTicket {
    @doc("A link to the cached data")
    link: url;

    @doc("When the cached data expires")
    expires: utcDateTime;
  }

  @doc("Errors returned by the `/data` endpoints.")
  model ErrorResponse {
    error: string;
    message?: string;
    note?: string;
  }

  model SuccessResponse extends RateLimitHeaders {
    @statusCode status: 200;
    @body body: DataTicket;
  }

  model UnauthorizedResponse {
    @statusCode status: 401;
    @body body: ErrorResponse;
  }

  model RateLimitedResponse extends RateLimitHeaders {
    @statusCode status: 429;
    @body body: ErrorResponse;
  }

  model MaintenanceResponse {
    @statusCode status: 503;
    @body body: ErrorResponse;
  }

  alias ApiResponses =
    | SuccessResponse
    | UnauthorizedResponse
    | RateLimitedResponse
    | MaintenanceResponse;

  @doc("iRacing Event Type")
  enum EventType {
    @doc("Practice")
    practice: 2,
    @doc("Qualifying")
    qualifying: 3,
    @doc("Time trial")
    timeTrial: 4,
    @doc("Race")
    race: 5,
  }

  @doc("Racing category.")
  enum Category {
    @doc("Oval discipline")
    oval: "oval",
    @doc("Road discipline. Legacy, use `sports_car` or `formula_car` instead.")
    road: "road",
    @doc("Dirt road discipline.")
    dirtRoad: "dirt_road",
    @doc("Dirt oval discipline.")
    dirtOval: "dirt_oval",
    @doc("Sports car discipline.")
    sportsCar: "sports_car",
    @doc("Formula car discipline.")
    formulaCar: "formula_car",
  }

  @tag("constants")
  @route("/constants")
  interface Constants {
    @get("/event_types")
    @doc("Constant; returned directly as an array of objects")
    getEventTypes(): ApiResponses;

    @get("/categories")
    @doc("List the current iRacing racing categories.")
    getCategories(): ApiResponses;

    @get("/divisions")
    @doc("List license divisions for the active season.")
    getDivisions(): ApiResponses;
  }

  @tag("car")
  @route("/car")
  interface Cars {
    @get("/get")
    @doc("Retrieve the cached payload for an iRacing car.")
    getCar(): ApiResponses;

    @get("/assets")
    @doc("Return a link to the media assets for cars.")
    getCarAssets(): ApiResponses;
  }

  @tag("doc")
  @route("/doc")
  interface Documentation {
    @get
    @doc("List `/data` services, mirroring the behaviour described by the Zod schema.")
    getServices(): ApiResponses;

    @get("/car")
    @doc("Describe car-related `/data` endpoints.")
    getCarDocs(): ApiResponses;
  }
}
