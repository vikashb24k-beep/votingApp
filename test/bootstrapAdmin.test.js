const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const bootstrapAdmin = require("../src/config/bootstrapAdmin");

test("bootstrapAdmin promotes an existing user with the configured admin aadhar number", async () => {
  const originalFindOne = User.findOne;

  process.env.ADMIN_AADHAR_NUMBER = "123456789123";
  process.env.ADMIN_PASSWORD = "secret123";
  process.env.ADMIN_NAME = "Boot Admin";

  let findOneCalls = 0;
  let savedUser = null;

  const existingUser = {
    name: "Vikash",
    role: "user",
    password: "old-password",
    async save() {
      savedUser = {
        name: this.name,
        role: this.role,
        password: this.password,
      };
    },
  };

  User.findOne = (query) => {
    findOneCalls += 1;

    if (query.role === "admin") {
      return Promise.resolve(null);
    }

    if (query.aadharNumber === "123456789123") {
      return {
        select: async () => existingUser,
      };
    }

    return Promise.resolve(null);
  };

  try {
    await bootstrapAdmin();

    assert.equal(findOneCalls, 2);
    assert.deepEqual(savedUser, {
      name: "Boot Admin",
      role: "admin",
      password: "secret123",
    });
  } finally {
    User.findOne = originalFindOne;
  }
});
