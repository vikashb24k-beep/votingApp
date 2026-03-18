const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const bootstrapAdmin = require("../src/config/bootstrapAdmin");

test("bootstrapAdmin promotes an existing user with configured admin credentials", async () => {
  const originalFindOne = User.findOne;

  process.env.ADMIN_AADHAR_NUMBER = "123456789123";
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "secret123";
  process.env.ADMIN_NAME = "Boot Admin";

  let savedUser = null;

  const existingUser = {
    name: "Vikash",
    email: "vikash@example.com",
    role: "user",
    password: "old-password",
    async save() {
      savedUser = {
        name: this.name,
        email: this.email,
        role: this.role,
        password: this.password,
      };
    },
  };

  User.findOne = (query) => {
    if (query.aadharNumber === "123456789123") {
      return {
        select: async () => existingUser,
      };
    }

    if (query.role === "admin") {
      return {
        select: async () => null,
      };
    }

    return Promise.resolve(null);
  };

  try {
    await bootstrapAdmin();

    assert.deepEqual(savedUser, {
      name: "Boot Admin",
      email: "admin@example.com",
      role: "admin",
      password: "secret123",
    });
  } finally {
    User.findOne = originalFindOne;
  }
});

test("bootstrapAdmin synchronizes an existing admin with configured email credentials", async () => {
  const originalFindOne = User.findOne;

  process.env.ADMIN_AADHAR_NUMBER = "123456789123";
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "secret123";
  process.env.ADMIN_NAME = "Configured Admin";

  let savedUser = null;

  const existingAdmin = {
    name: "Old Admin",
    email: "old-admin@example.com",
    aadharNumber: "999999999999",
    role: "admin",
    password: "old-password",
    async save() {
      savedUser = {
        name: this.name,
        email: this.email,
        aadharNumber: this.aadharNumber,
        role: this.role,
        password: this.password,
      };
    },
  };

  User.findOne = (query) => {
    if (query.aadharNumber === "123456789123") {
      return {
        select: async () => null,
      };
    }

    if (query.role === "admin") {
      return {
        select: async () => existingAdmin,
      };
    }

    return Promise.resolve(null);
  };

  try {
    await bootstrapAdmin();

    assert.deepEqual(savedUser, {
      name: "Configured Admin",
      email: "admin@example.com",
      aadharNumber: "123456789123",
      role: "admin",
      password: "secret123",
    });
  } finally {
    User.findOne = originalFindOne;
  }
});
