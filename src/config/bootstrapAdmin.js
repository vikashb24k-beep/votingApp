const User = require("../models/User");

const bootstrapAdmin = async () => {
  const adminAadharNumber = process.env.ADMIN_AADHAR_NUMBER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminAadharNumber || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    return;
  }

  const admin = new User({
    name: process.env.ADMIN_NAME || "Admin",
    aadharNumber: adminAadharNumber,
    password: adminPassword,
    role: "admin",
  });

  await admin.save();
  console.log("Default admin account created");
};

module.exports = bootstrapAdmin;
