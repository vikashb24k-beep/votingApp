const express = require("express");
const { signup, register, login, sendOtp, verifyOtp } = require("../controllers/authController");

const router = express.Router();

router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verifyOtp);
router.post("/auth/register", register);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
