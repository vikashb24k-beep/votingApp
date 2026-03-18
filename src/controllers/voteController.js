const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const User = require("../models/User");
const Vote = require("../models/Vote");

const createConflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

const castVote = async (req, res) => {
  const { candidateId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    return res.status(400).json({ message: "Invalid candidate id" });
  }

  if (req.user.role === "admin") {
    return res.status(403).json({ message: "Admin users cannot vote" });
  }

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: req.user._id,
      role: "user",
      hasVoted: false,
    },
    {
      $set: { hasVoted: true },
    },
    {
      new: true,
    }
  );

  if (!updatedUser) {
    return res.status(400).json({ message: "You have already voted" });
  }

  let createdVote = null;

  try {
    createdVote = await Vote.create({
      userId: req.user._id,
      candidateId,
    });

    const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });
    if (!updatedCandidate) {
      throw createConflictError("Candidate was removed before the vote could be finalized");
    }
  } catch (error) {
    if (error?.code === 11000) {
      await User.findByIdAndUpdate(req.user._id, { $set: { hasVoted: true } });
      return res.status(400).json({ message: "Vote already recorded for this user" });
    }

    await User.findByIdAndUpdate(req.user._id, { $set: { hasVoted: false } });

    if (createdVote?._id) {
      await Vote.findByIdAndDelete(createdVote._id);
    }

    throw error;
  }

  res.status(200).json({
    message: "Vote cast successfully",
    hasVoted: true,
  });
};

module.exports = {
  castVote,
};
