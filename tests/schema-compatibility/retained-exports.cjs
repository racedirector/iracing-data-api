// Preserve the frozen inventory. Commit 9afb118 intentionally removed these
// linked-payload contracts: validation of downloaded content belongs to consumers.
const historical = require("./exports.json");
const removed = new Set([
  "GetCarAssetsResponseSchema",
  "GetCarResponseSchema",
  "GetTrackAssetsResponseSchema",
  "GetTrackResponseSchema",
  "GetCarAssetsResponse",
  "GetCarResponse",
  "GetTrackAssetsResponse",
  "GetTrackResponse",
]);
module.exports = {
  retained: historical.filter((entry) => !removed.has(entry.new)),
  removed: historical.filter((entry) => removed.has(entry.new)),
};
