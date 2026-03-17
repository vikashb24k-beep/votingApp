const express = require("express");
const {
  getCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
} = require("../controllers/candidateController");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", getCandidates);
router.post("/", protect, requireAdmin, addCandidate);
router.put("/:candidateId", protect, requireAdmin, updateCandidate);
router.delete("/:candidateId", protect, requireAdmin, deleteCandidate);

module.exports = router;
