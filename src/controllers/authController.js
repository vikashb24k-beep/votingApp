const User = require("../models/User");
const { signToken } = require("../middleware/auth");

const normalizeAadhar = (value) => String(value || "").trim();
const normalizeName = (value) => String(value || "").trim();

const signup = async (req, res) => {
  const name = normalizeName(req.body.name);
  const aadharNumber = normalizeAadhar(req.body.aadharNumber);
  const password = String(req.body.password || "");

  if (!name || !aadharNumber || !password) {
    return res.status(400).json({ message: "Name, aadhar number, and password are required" });
  }

  if (!/^\d{12}$/.test(aadharNumber)) {
    return res.status(400).json({ message: "Aadhar number must be exactly 12 digits" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const existingUser = await User.findOne({ aadharNumber });
  if (existingUser) {
    return res.status(409).json({ message: "A user with this aadhar number already exists. Please login instead." });
  }

  const user = await User.create({
    name,
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
  const aadharNumber = normalizeAadhar(req.body.aadharNumber);
  const password = String(req.body.password || "");

  if (!aadharNumber || !password) {
    return res.status(400).json({ message: "Aadhar number and password are required" });
  }

  const user = await User.findOne({ aadharNumber }).select("+password");
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
