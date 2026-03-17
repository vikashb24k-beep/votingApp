const test = require("node:test");
const assert = require("node:assert/strict");

const Candidate = require("../src/models/Candidate");
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
  const originalFindByIdAndDelete = Candidate.findByIdAndDelete;
  let findByIdAndDeleteCalled = false;
  Candidate.findByIdAndDelete = async () => {
    findByIdAndDeleteCalled = true;
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
    assert.equal(findByIdAndDeleteCalled, false);
  } finally {
    Candidate.findByIdAndDelete = originalFindByIdAndDelete;
  }
});
