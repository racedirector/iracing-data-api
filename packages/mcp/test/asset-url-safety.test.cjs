const assert = require("node:assert/strict");
const test = require("node:test");

test("image folders trim trailing slashes without scanning every slash-run suffix", async () => {
  const { imageUrl } = await import("../dist/index.js");
  assert.equal(
    imageUrl(
      "cars",
      {
        folder: "/img/cars/example///",
        small_image: "small.jpg",
      },
      "small_image",
    ).href,
    "https://images-static.iracing.com/img/cars/example/small.jpg",
  );

  // A long interior slash run followed by a non-slash is adversarial for an
  // unanchored /\/+$/ replacement, even when another slash run ends the string.
  const slashes = "/".repeat(100_000);
  const path = `/img/cars/${slashes}example`;
  assert.equal(
    imageUrl(
      "cars",
      {
        folder: `${path}${slashes}`,
        small_image: "small.jpg",
      },
      "small_image",
    ).pathname,
    `${path}/small.jpg`,
  );
});
