const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { signToken } = require("../middleware/auth");
const mailer = require("../config/mailer");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const REGISTER_VERIFICATION_EXPIRY = "10m";

const normalizeAadhar = (value) => String(value || "").trim();
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeName = (value) => String(value || "").trim();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is missing");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const createRegisterVerificationToken = (email) =>
  jwt.sign(
    {
      email,
      purpose: "register",
    },
    getJwtSecret(),
    { expiresIn: REGISTER_VERIFICATION_EXPIRY }
  );

const verifyRegisterVerificationToken = (token) => {
  const payload = jwt.verify(token, getJwtSecret());

  if (payload.purpose !== "register" || !payload.email) {
    const error = new Error("Invalid verification token");
    error.statusCode = 401;
    throw error;
  }

  return payload;
};

const sendOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "A user with this email already exists. Please login instead." });
  }

  const existingOtp = await Otp.findOne({ email });
  const now = Date.now();

  if (existingOtp && existingOtp.expiresAt.getTime() > now) {
    const lastSentAt = existingOtp.updatedAt ? existingOtp.updatedAt.getTime() : 0;

    if (now - lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      return res.status(429).json({ message: "Please wait before requesting another OTP" });
    }
  }

  const otp = generateOtp();
  const expiresAt = new Date(now + OTP_EXPIRY_MS);

  const otpRecord = await Otp.findOneAndUpdate(
    { email },
    { email, otp, expiresAt },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  try {
    await mailer.sendOtpEmail(email, otp);
  } catch (error) {
    await Otp.deleteOne({ email });
    throw error;
  }

  res.status(200).json({
    message: "OTP sent successfully",
    expiresAt: otpRecord.expiresAt,
  });
};

const verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || "").trim();

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: "OTP must be exactly 6 digits" });
  }

  const otpRecord = await Otp.findOne({ email });

  if (!otpRecord) {
    return res.status(400).json({ message: "OTP not found or expired" });
  }

  if (otpRecord.expiresAt.getTime() <= Date.now()) {
    await Otp.deleteOne({ email });
    return res.status(400).json({ message: "OTP not found or expired" });
  }

  if (otpRecord.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await Otp.deleteOne({ email });

  res.status(200).json({
    message: "OTP verified successfully",
    verificationToken: createRegisterVerificationToken(email),
  });
};

const register = async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const aadharNumber = normalizeAadhar(req.body.aadharNumber);
  const password = String(req.body.password || "");
  const verificationToken = String(req.body.verificationToken || "").trim();

  if (!name || !email || !aadharNumber || !password || !verificationToken) {
    return res.status(400).json({ message: "Name, email, aadhar number, password, and verification token are required" });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: "Email address is invalid" });
  }

  if (!/^\d{12}$/.test(aadharNumber)) {
    return res.status(400).json({ message: "Aadhar number must be exactly 12 digits" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  let payload;

  try {
    payload = verifyRegisterVerificationToken(verificationToken);
  } catch (error) {
    return res.status(error.statusCode || 401).json({ message: error.message || "Invalid verification token" });
  }

  if (payload.email !== email) {
    return res.status(401).json({ message: "Verification token does not match this email address" });
  }

  const existingUser = await User.findOne({
    $or: [{ aadharNumber }, { email }],
  });

  if (existingUser?.aadharNumber === aadharNumber) {
    return res.status(409).json({ message: "A user with this aadhar number already exists. Please login instead." });
  }

  if (existingUser?.email === email) {
    return res.status(409).json({ message: "A user with this email already exists. Please login instead." });
  }

  const user = await User.create({
    name,
    email,
    aadharNumber,
    password,
  });

  const token = signToken(user);
  res.status(201).json({
    token,
    user: user.toSafeObject(),
  });
};

const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  res.status(200).json({
    token,
    user: user.toSafeObject(),
  });
};

module.exports = {
  signup: register,
  register,
  login,
  sendOtp,
  verifyOtp,
};
