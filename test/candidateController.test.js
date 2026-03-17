const test = require("node:test");
const assert = require("node:assert/strict");

const Candidate = require("../src/models/Candidate");
const Vote = require("../src/models/Vote");
const { updateCandidate, deleteCandidate } = require("../src/controllers/candidateController");

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

test("updateCandidate returns 400 for an invalid candidate id", async () => {
  const originalFindById = Candidate.findById;
  let findByIdCalled = false;
  Candidate.findById = async () => {
    findByIdCalled = true;
    return null;
  };

  try {
    const req = {
      params: { candidateId: "not-a-valid-id" },
      body: { name: "Alice" },
    };
    const res = createResponse();

    await updateCandidate(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Invalid candidate id" });
    assert.equal(findByIdCalled, false);
  } finally {
    Candidate.findById = originalFindById;
  }
});

test("deleteCandidate returns 400 for an invalid candidate id", async () => {
  const originalFindById = Candidate.findById;
  let findByIdCalled = false;
  Candidate.findById = async () => {
    findByIdCalled = true;
    return null;
  };

  try {
    const req = {
      params: { candidateId: "not-a-valid-id" },
    };
    const res = createResponse();

    await deleteCandidate(req, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Invalid candidate id" });
    assert.equal(findByIdCalled, false);
  } finally {
    Candidate.findById = originalFindById;
  }
});

test("deleteCandidate returns 409 when the candidate already has recorded votes", async () => {
  const originalFindById = Candidate.findById;
  const originalVoteExists = Vote.exists;

  let deleteCalled = false;
  Candidate.findById = async () => ({
    _id: "507f191e810c19729de860ea",
    voteCount: 2,
    deleteOne: async () => {
      deleteCalled = true;
    },
  });
  Vote.exists = async () => null;

  try {
    const req = {
      params: { candidateId: "507f191e810c19729de860ea" },
    };
    const res = createResponse();

    await deleteCandidate(req, res);

    assert.equal(res.statusCode, 409);
    assert.deepEqual(res.body, { message: "Cannot delete a candidate with recorded votes" });
    assert.equal(deleteCalled, false);
  } finally {
    Candidate.findById = originalFindById;
    Vote.exists = originalVoteExists;
  }
});
