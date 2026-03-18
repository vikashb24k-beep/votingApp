const test = require("node:test");
const assert = require("node:assert/strict");

const { signToken } = require("../src/middleware/auth");

test("signToken throws a clear error when JWT_SECRET is missing", () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  try {
    assert.throws(
      () =>
        signToken({
          _id: { toString: () => "507f191e810c19729de860ea" },
          role: "user",
        }),
      /JWT_SECRET is missing/
    );
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  }
});
