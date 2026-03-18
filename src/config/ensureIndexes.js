const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Otp = require("../models/Otp");
const Vote = require("../models/Vote");

const ensureIndexes = async () => {
  await Promise.all([User.createIndexes(), Candidate.createIndexes(), Otp.createIndexes(), Vote.createIndexes()]);
};

module.exports = ensureIndexes;
