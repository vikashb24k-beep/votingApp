const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

const ensureIndexes = async () => {
  await Promise.all([User.createIndexes(), Candidate.createIndexes(), Vote.createIndexes()]);
};

module.exports = ensureIndexes;
