const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const repairUserIndexes = require("../src/scripts/repairUserIndexes");

test("repairUserIndexes skips work when the users collection does not exist", async () => {
  let listCollectionsCalled = false;

  mongoose.connection.db = {
    listCollections(query, options) {
      listCollectionsCalled = true;
      assert.deepEqual(query, { name: "users" });
      assert.deepEqual(options, { nameOnly: true });

      return {
        hasNext: async () => false,
      };
    },
  };

  let collectionCalled = false;
  mongoose.connection.collection = () => {
    collectionCalled = true;
    throw new Error("collection should not be queried when users collection is missing");
  };

  await repairUserIndexes();

  assert.equal(listCollectionsCalled, true);
  assert.equal(collectionCalled, false);
});

test("repairUserIndexes removes the stale aadharCardNumber index when present", async () => {
  mongoose.connection.db = {
    listCollections() {
      return {
        hasNext: async () => true,
      };
    },
  };

  let droppedIndexName = "";
  mongoose.connection.collection = (name) => {
    assert.equal(name, "users");

    return {
      indexes: async () => [{ name: "_id_" }, { name: "aadharCardNumber_1" }],
      dropIndex: async (indexName) => {
        droppedIndexName = indexName;
      },
    };
  };

  await repairUserIndexes();

  assert.equal(droppedIndexName, "aadharCardNumber_1");
});
