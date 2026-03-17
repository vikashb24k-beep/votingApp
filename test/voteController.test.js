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

    await assert.rejects(() => castVote(req, res), /Candidate not found while saving vote/);

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
