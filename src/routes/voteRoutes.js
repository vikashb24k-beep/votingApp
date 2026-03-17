const express = require("express");
const { castVote } = require("../controllers/voteController");
const { protect } = require("../middleware/auth");
const { getVoteCounts } = require("../controllers/candidateController");

const router = express.Router();

router.post("/vote/:candidateId", protect, castVote);
router.get("/vote/counts", getVoteCounts);

module.exports = router;
