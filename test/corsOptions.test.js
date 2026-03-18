const test = require("node:test");
const assert = require("node:assert/strict");

const { parseAllowedOrigins, isOriginAllowed, createCorsOptions } = require("../src/config/corsOptions");

test("parseAllowedOrigins supports comma-separated client urls", () => {
  const originalClientUrl = process.env.CLIENT_URL;
  process.env.CLIENT_URL = "http://localhost:5173, https://vote.example.com";

  try {
    assert.deepEqual(parseAllowedOrigins(), ["http://localhost:5173", "https://vote.example.com"]);
  } finally {
    if (originalClientUrl === undefined) {
      delete process.env.CLIENT_URL;
    } else {
      process.env.CLIENT_URL = originalClientUrl;
    }
  }
});

test("isOriginAllowed permits requests without an origin header", () => {
  assert.equal(isOriginAllowed(undefined, ["http://localhost:5173"]), true);
});

test("createCorsOptions rejects origins outside the allowlist", async () => {
  const originalClientUrl = process.env.CLIENT_URL;
  process.env.CLIENT_URL = "http://localhost:5173, https://vote.example.com";

  try {
    const options = createCorsOptions();

    await assert.rejects(
      () =>
        new Promise((resolve, reject) => {
          options.origin("https://evil.example.com", (error, allowed) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(allowed);
          });
        }),
      /CORS origin not allowed/
    );
  } finally {
    if (originalClientUrl === undefined) {
      delete process.env.CLIENT_URL;
    } else {
      process.env.CLIENT_URL = originalClientUrl;
    }
  }
});
