const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

const isValidCandidateId = (candidateId) => mongoose.Types.ObjectId.isValid(candidateId);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCandidates = async (req, res) => {
  const candidates = await Candidate.find().sort({ voteCount: -1, createdAt: 1 });
  res.status(200).json({ candidates });
};

const addCandidate = async (req, res) => {
  const { name, party } = req.body;
  const normalizedName = typeof name === "string" ? name.trim() : "";

  if (!normalizedName) {
    return res.status(400).json({ message: "Candidate name is required" });
  }

  const existingCandidate = await Candidate.findOne({
    name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
  });
  if (existingCandidate) {
    return res.status(409).json({ message: "A candidate with this name already exists" });
  }

  const candidate = await Candidate.create({
    name: normalizedName,
    party: typeof party === "string" ? party.trim() : "",
  });

  res.status(201).json({ candidate });
};

const updateCandidate = async (req, res) => {
  const { name, party } = req.body;
  const normalizedName = typeof name === "string" ? name.trim() : null;

  if (!isValidCandidateId(req.params.candidateId)) {
    return res.status(400).json({ message: "Invalid candidate id" });
  }

  if (typeof name === "string" && !normalizedName) {
    return res.status(400).json({ message: "Candidate name cannot be empty" });
  }

  const candidate = await Candidate.findById(req.params.candidateId);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  if (typeof name === "string") {
    const existingCandidate = await Candidate.findOne({
      _id: { $ne: candidate._id },
      name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: "i" },
    });
    if (existingCandidate) {
      return res.status(409).json({ message: "A candidate with this name already exists" });
    }

    candidate.name = normalizedName;
  }

  if (typeof party === "string") {
    candidate.party = party.trim();
  }

  await candidate.save();
  res.status(200).json({ candidate });
};

const deleteCandidate = async (req, res) => {
  if (!isValidCandidateId(req.params.candidateId)) {
    return res.status(400).json({ message: "Invalid candidate id" });
  }

  const candidate = await Candidate.findById(req.params.candidateId);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  const hasRecordedVotes = candidate.voteCount > 0 || (await Vote.exists({ candidateId: candidate._id }));
  if (hasRecordedVotes) {
    return res.status(409).json({ message: "Cannot delete a candidate with recorded votes" });
  }

  await candidate.deleteOne();

  res.status(200).json({ message: "Candidate deleted successfully" });
};

const getVoteCounts = async (req, res) => {
  const candidates = await Candidate.find({}, { name: 1, party: 1, voteCount: 1 }).sort({
    voteCount: -1,
    createdAt: 1,
  });

  res.status(200).json({ candidates });
};

module.exports = {
  getCandidates,
  addCandidate,
  createCandidate: addCandidate,
  updateCandidate,
  deleteCandidate,
  getVoteCounts,
};
