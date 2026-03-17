const express = require("express");
const { getProfile, updatePassword } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile/password", protect, updatePassword);

module.exports = router;
