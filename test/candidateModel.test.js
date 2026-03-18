const test = require("node:test");
const assert = require("node:assert/strict");
const Candidate = require("../src/models/Candidate");

test("candidate model defines a case-insensitive unique index on name", () => {
  const indexes = Candidate.schema.indexes();
  const nameIndex = indexes.find(([fields]) => fields.name === 1);

  assert.ok(nameIndex, "expected a name index to be defined");
  assert.equal(nameIndex[1].unique, true);
  assert.deepEqual(nameIndex[1].collation, { locale: "en", strength: 2 });
});
