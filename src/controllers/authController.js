const User = require("../models/User");
const { signToken } = require("../middleware/auth");

const normalizeAadhar = (value) => String(value || "").trim();
const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeName = (value) => String(value || "").trim();
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const signup = async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const aadharNumber = normalizeAadhar(req.body.aadharNumber);
  const password = String(req.body.password || "");

  if (!name || !email || !aadharNumber || !password) {
    return res.status(400).json({ message: "Name, email, aadhar number, and password are required" });
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
  signup,
  login,
};
