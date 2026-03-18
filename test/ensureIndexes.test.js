const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const Candidate = require("../src/models/Candidate");
const Otp = require("../src/models/Otp");
const Vote = require("../src/models/Vote");
const ensureIndexes = require("../src/config/ensureIndexes");

test("ensureIndexes creates indexes for all persisted models", async () => {
  const originalUserCreateIndexes = User.createIndexes;
  const originalCandidateCreateIndexes = Candidate.createIndexes;
  const originalOtpCreateIndexes = Otp.createIndexes;
  const originalVoteCreateIndexes = Vote.createIndexes;

  const calls = [];
  User.createIndexes = async () => {
    calls.push("User");
  };
  Candidate.createIndexes = async () => {
    calls.push("Candidate");
  };
  Otp.createIndexes = async () => {
    calls.push("Otp");
  };
  Vote.createIndexes = async () => {
    calls.push("Vote");
  };

  try {
    await ensureIndexes();
    assert.deepEqual(calls.sort(), ["Candidate", "Otp", "User", "Vote"]);
  } finally {
    User.createIndexes = originalUserCreateIndexes;
    Candidate.createIndexes = originalCandidateCreateIndexes;
    Otp.createIndexes = originalOtpCreateIndexes;
    Vote.createIndexes = originalVoteCreateIndexes;
  }
});
