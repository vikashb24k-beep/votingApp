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

  const existingUserWithAdminAadhar = await User.findOne({ aadharNumber: adminAadharNumber }).select("+password");
  if (existingUserWithAdminAadhar) {
    existingUserWithAdminAadhar.role = "admin";
    existingUserWithAdminAadhar.name = process.env.ADMIN_NAME || existingUserWithAdminAadhar.name;
    existingUserWithAdminAadhar.password = adminPassword;
    await existingUserWithAdminAadhar.save();
    console.log("Existing user promoted to admin");
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
