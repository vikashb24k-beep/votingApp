const test = require("node:test");
const assert = require("node:assert/strict");

const Candidate = require("../src/models/Candidate");
const User = require("../src/models/User");
const Vote = require("../src/models/Vote");
const { castVote } = require("../src/controllers/voteController");

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test("castVote rolls back the vote and user flag when candidate count update fails", async () => {
  const originalCandidateFindById = Candidate.findById;
  const originalCandidateFindByIdAndUpdate = Candidate.findByIdAndUpdate;
  const originalUserFindOneAndUpdate = User.findOneAndUpdate;
  const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;
  const originalVoteCreate = Vote.create;
  const originalVoteFindByIdAndDelete = Vote.findByIdAndDelete;

  const rollbackCalls = [];

  Candidate.findById = async () => ({ _id: "507f191e810c19729de860eb" });
  Candidate.findByIdAndUpdate = async () => null;
  User.findOneAndUpdate = async () => ({ _id: "507f191e810c19729de860ea" });
  User.findByIdAndUpdate = async (userId, update) => {
    rollbackCalls.push({ type: "user", userId, update });
  };
  Vote.create = async () => ({ _id: "vote-1" });
  Vote.findByIdAndDelete = async (voteId) => {
    rollbackCalls.push({ type: "vote", voteId });
  };

  try {
    const req = {
      params: { candidateId: "507f191e810c19729de860eb" },
      user: { _id: "507f191e810c19729de860ea", role: "user" },
    };
    const res = createResponse();

    await assert.rejects(async () => castVote(req, res), (error) => {
      assert.equal(error.message, "Candidate was removed before the vote could be finalized");
      assert.equal(error.statusCode, 409);
      return true;
    });

    assert.deepEqual(rollbackCalls, [
      {
        type: "user",
        userId: "507f191e810c19729de860ea",
        update: { $set: { hasVoted: false } },
      },
      {
        type: "vote",
        voteId: "vote-1",
      },
    ]);
  } finally {
    Candidate.findById = originalCandidateFindById;
    Candidate.findByIdAndUpdate = originalCandidateFindByIdAndUpdate;
    User.findOneAndUpdate = originalUserFindOneAndUpdate;
    User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
    Vote.create = originalVoteCreate;
    Vote.findByIdAndDelete = originalVoteFindByIdAndDelete;
  }
});

test("castVote preserves hasVoted when a duplicate vote record already exists", async () => {
  const originalCandidateFindById = Candidate.findById;
  const originalUserFindOneAndUpdate = User.findOneAndUpdate;
  const originalUserFindByIdAndUpdate = User.findByIdAndUpdate;
  const originalVoteCreate = Vote.create;

  const userUpdates = [];

  Candidate.findById = async () => ({ _id: "507f191e810c19729de860eb" });
  User.findOneAndUpdate = async () => ({ _id: "507f191e810c19729de860ea" });
  User.findByIdAndUpdate = async (userId, update) => {
    userUpdates.push({ userId, update });
  };
  Vote.create = async () => {
    const error = new Error("duplicate vote");
    error.code = 11000;
    throw error;
  };

  try {
    const req = {
      params: { candidateId: "507f191e810c19729de860eb" },
      user: { _id: "507f191e810c19729de860ea", role: "user" },
    };
    const res = createResponse();

    await castVote(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Vote already recorded for this user" });
    assert.deepEqual(userUpdates, [
      {
        userId: "507f191e810c19729de860ea",
        update: { $set: { hasVoted: true } },
      },
    ]);
  } finally {
    Candidate.findById = originalCandidateFindById;
    User.findOneAndUpdate = originalUserFindOneAndUpdate;
    User.findByIdAndUpdate = originalUserFindByIdAndUpdate;
    Vote.create = originalVoteCreate;
  }
});
