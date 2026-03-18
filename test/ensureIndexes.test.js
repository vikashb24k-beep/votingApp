const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../src/models/User");
const Candidate = require("../src/models/Candidate");
const Vote = require("../src/models/Vote");
const ensureIndexes = require("../src/config/ensureIndexes");

test("ensureIndexes creates indexes for all persisted models", async () => {
  const originalUserCreateIndexes = User.createIndexes;
  const originalCandidateCreateIndexes = Candidate.createIndexes;
  const originalVoteCreateIndexes = Vote.createIndexes;

  const calls = [];
  User.createIndexes = async () => {
    calls.push("User");
  };
  Candidate.createIndexes = async () => {
    calls.push("Candidate");
  };
  Vote.createIndexes = async () => {
    calls.push("Vote");
  };

  try {
    await ensureIndexes();
    assert.deepEqual(calls.sort(), ["Candidate", "User", "Vote"]);
  } finally {
    User.createIndexes = originalUserCreateIndexes;
    Candidate.createIndexes = originalCandidateCreateIndexes;
    Vote.createIndexes = originalVoteCreateIndexes;
  }
});
