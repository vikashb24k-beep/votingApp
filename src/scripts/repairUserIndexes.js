const mongoose = require("mongoose");

const repairUserIndexes = async () => {
  const collection = mongoose.connection.collection("users");
  const indexes = await collection.indexes();

  if (indexes.some((index) => index.name === "aadharCardNumber_1")) {
    await collection.dropIndex("aadharCardNumber_1");
    console.log("Removed stale users index: aadharCardNumber_1");
  }
};

module.exports = repairUserIndexes;
