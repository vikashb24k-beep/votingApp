const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const { signup, login } = require("../src/controllers/authController");

const createResponse = () => {
  const response = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };

  return response;
};

test("signup requires an email address", async () => {
  const req = {
    body: {
      name: "Vikash Kumar",
      aadharNumber: "123456789123",
      password: "secret123",
    },
  };
  const res = createResponse();

  await signup(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    message: "Name, email, aadhar number, and password are required",
  });
});

test("signup stores a normalized email address", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const originalJwtSecret = process.env.JWT_SECRET;

  process.env.JWT_SECRET = "test-secret";

  let createdUserInput = null;

  User.findOne = async () => null;
  User.create = async (input) => {
    createdUserInput = input;

    return {
      _id: "507f1f77bcf86cd799439011",
      ...input,
      role: "user",
      hasVoted: false,
      createdAt: new Date("2026-03-18T00:00:00.000Z"),
      updatedAt: new Date("2026-03-18T00:00:00.000Z"),
      toSafeObject() {
        return {
          id: this._id,
          name: this.name,
          email: this.email,
          aadharNumber: this.aadharNumber,
          role: this.role,
          hasVoted: this.hasVoted,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      },
    };
  };

  const req = {
    body: {
      name: "Vikash Kumar",
      email: "VIKASH@Example.COM ",
      aadharNumber: "123456789123",
      password: "secret123",
    },
  };
  const res = createResponse();

  try {
    await signup(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(createdUserInput.email, "vikash@example.com");
    assert.equal(res.payload.user.email, "vikash@example.com");
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

test("login accepts an email address", async () => {
  const originalFindOne = User.findOne;
  const originalJwtSecret = process.env.JWT_SECRET;

  process.env.JWT_SECRET = "test-secret";

  let receivedQuery = null;

  const existingUser = {
    _id: {
      toString() {
        return "507f1f77bcf86cd799439011";
      },
    },
    name: "Vikash Kumar",
    email: "vikash@example.com",
    aadharNumber: "123456789123",
    role: "user",
    hasVoted: false,
    createdAt: new Date("2026-03-18T00:00:00.000Z"),
    updatedAt: new Date("2026-03-18T00:00:00.000Z"),
    async comparePassword(candidatePassword) {
      return candidatePassword === "secret123";
    },
    toSafeObject() {
      return {
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        aadharNumber: this.aadharNumber,
        role: this.role,
        hasVoted: this.hasVoted,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
  };

  User.findOne = (query) => {
    receivedQuery = query;
    return {
      select: async () => existingUser,
    };
  };

  const req = {
    body: {
      email: "vikash@example.com",
      password: "secret123",
    },
  };
  const res = createResponse();

  try {
    await login(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(receivedQuery, { email: "vikash@example.com" });
    assert.equal(res.payload.user.email, "vikash@example.com");
    assert.ok(res.payload.token);
  } finally {
    User.findOne = originalFindOne;
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

test("login rejects requests without an email address", async () => {
  const req = {
    body: {
      password: "secret123",
    },
  };
  const res = createResponse();

  await login(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    message: "Email and password are required",
  });
});
