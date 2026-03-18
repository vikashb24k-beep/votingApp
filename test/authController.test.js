const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const Otp = require("../src/models/Otp");
const mailer = require("../src/config/mailer");
const { sendOtp, verifyOtp, register, login } = require("../src/controllers/authController");

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

test("sendOtp stores an OTP and sends it by email", async () => {
  const originalUserFindOne = User.findOne;
  const originalOtpFindOne = Otp.findOne;
  const originalOtpFindOneAndUpdate = Otp.findOneAndUpdate;
  const originalSendOtpEmail = mailer.sendOtpEmail;

  let savedOtpInput = null;
  let mailedOtp = null;

  User.findOne = async () => null;
  Otp.findOne = async () => null;
  Otp.findOneAndUpdate = async (query, update) => {
    savedOtpInput = { query, update };
    return {
      expiresAt: update.expiresAt,
    };
  };
  mailer.sendOtpEmail = async (email, otp) => {
    mailedOtp = { email, otp };
  };

  const req = {
    body: {
      email: "VIKASH@Example.COM ",
    },
  };
  const res = createResponse();

  try {
    await sendOtp(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(savedOtpInput.query, { email: "vikash@example.com" });
    assert.equal(savedOtpInput.update.email, "vikash@example.com");
    assert.match(savedOtpInput.update.otp, /^\d{6}$/);
    assert.deepEqual(mailedOtp, {
      email: "vikash@example.com",
      otp: savedOtpInput.update.otp,
    });
  } finally {
    User.findOne = originalUserFindOne;
    Otp.findOne = originalOtpFindOne;
    Otp.findOneAndUpdate = originalOtpFindOneAndUpdate;
    mailer.sendOtpEmail = originalSendOtpEmail;
  }
});

test("sendOtp blocks rapid repeat requests", async () => {
  const originalUserFindOne = User.findOne;
  const originalOtpFindOne = Otp.findOne;

  User.findOne = async () => null;
  Otp.findOne = async () => ({
    expiresAt: new Date(Date.now() + 60_000),
    updatedAt: new Date(),
  });

  const req = {
    body: {
      email: "vikash@example.com",
    },
  };
  const res = createResponse();

  try {
    await sendOtp(req, res);

    assert.equal(res.statusCode, 429);
    assert.deepEqual(res.payload, {
      message: "Please wait before requesting another OTP",
    });
  } finally {
    User.findOne = originalUserFindOne;
    Otp.findOne = originalOtpFindOne;
  }
});

test("verifyOtp deletes the OTP and returns a verification token", async () => {
  const originalOtpFindOne = Otp.findOne;
  const originalOtpDeleteOne = Otp.deleteOne;
  const originalJwtSecret = process.env.JWT_SECRET;

  process.env.JWT_SECRET = "test-secret";

  let deletedQuery = null;

  Otp.findOne = async () => ({
    email: "vikash@example.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 60_000),
  });
  Otp.deleteOne = async (query) => {
    deletedQuery = query;
  };

  const req = {
    body: {
      email: "vikash@example.com",
      otp: "123456",
    },
  };
  const res = createResponse();

  try {
    await verifyOtp(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(deletedQuery, { email: "vikash@example.com" });
    assert.ok(res.payload.verificationToken);
  } finally {
    Otp.findOne = originalOtpFindOne;
    Otp.deleteOne = originalOtpDeleteOne;
    process.env.JWT_SECRET = originalJwtSecret;
  }
});

test("register requires a verification token", async () => {
  const req = {
    body: {
      name: "Vikash Kumar",
      email: "vikash@example.com",
      aadharNumber: "123456789123",
      password: "secret123",
    },
  };
  const res = createResponse();

  await register(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    message: "Name, email, aadhar number, password, and verification token are required",
  });
});

test("register stores a normalized email after OTP verification", async () => {
  const originalUserFindOne = User.findOne;
  const originalUserCreate = User.create;
  const originalJwtSecret = process.env.JWT_SECRET;

  process.env.JWT_SECRET = "test-secret";

  let createdUserInput = null;
  let verificationToken = "";

  const verifyReq = {
    body: {
      email: "vikash@example.com",
      otp: "123456",
    },
  };
  const verifyRes = createResponse();
  const originalOtpFindOne = Otp.findOne;
  const originalOtpDeleteOne = Otp.deleteOne;

  Otp.findOne = async () => ({
    email: "vikash@example.com",
    otp: "123456",
    expiresAt: new Date(Date.now() + 60_000),
  });
  Otp.deleteOne = async () => {};

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

  try {
    await verifyOtp(verifyReq, verifyRes);
    verificationToken = verifyRes.payload.verificationToken;

    const req = {
      body: {
        name: "Vikash Kumar",
        email: "VIKASH@Example.COM ",
        aadharNumber: "123456789123",
        password: "secret123",
        verificationToken,
      },
    };
    const res = createResponse();

    await register(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(createdUserInput.email, "vikash@example.com");
    assert.equal(res.payload.user.email, "vikash@example.com");
  } finally {
    User.findOne = originalUserFindOne;
    User.create = originalUserCreate;
    Otp.findOne = originalOtpFindOne;
    Otp.deleteOne = originalOtpDeleteOne;
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
