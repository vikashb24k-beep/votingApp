const mongoose = require("mongoose");
const Candidate = require("../models/Candidate");
const Vote = require("../models/Vote");

const isValidCandidateId = (candidateId) => mongoose.Types.ObjectId.isValid(candidateId);

const getCandidates = async (req, res) => {
  const candidates = await Candidate.find().sort({ voteCount: -1, createdAt: 1 });
  res.status(200).json({ candidates });
};

const addCandidate = async (req, res) => {
  const { name, party } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Candidate name is required" });
  }

  const candidate = await Candidate.create({
    name: name.trim(),
    party: typeof party === "string" ? party.trim() : "",
  });

  res.status(201).json({ candidate });
};

const updateCandidate = async (req, res) => {
  const { name, party } = req.body;

  if (!isValidCandidateId(req.params.candidateId)) {
    return res.status(400).json({ message: "Invalid candidate id" });
  }

  const candidate = await Candidate.findById(req.params.candidateId);

  if (!candidate) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  if (typeof name === "string" && name.trim()) {
    candidate.name = name.trim();
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
