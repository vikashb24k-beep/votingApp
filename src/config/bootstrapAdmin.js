const User = require("../models/User");

const bootstrapAdmin = async () => {
  const adminAadharNumber = process.env.ADMIN_AADHAR_NUMBER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = String(process.env.ADMIN_EMAIL || "admin@votesphere.local").trim().toLowerCase();
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!adminAadharNumber || !adminPassword) {
    return;
  }

  const existingUserWithAdminAadhar = await User.findOne({ aadharNumber: adminAadharNumber }).select("+password");
  if (existingUserWithAdminAadhar) {
    existingUserWithAdminAadhar.role = "admin";
    existingUserWithAdminAadhar.name = adminName;
    existingUserWithAdminAadhar.email = adminEmail;
    existingUserWithAdminAadhar.password = adminPassword;
    await existingUserWithAdminAadhar.save();
    console.log("Existing user promoted to admin");
    return;
  }

  const existingAdmin = await User.findOne({ role: "admin" }).select("+password");
  if (existingAdmin) {
    existingAdmin.name = adminName;
    existingAdmin.email = adminEmail;
    existingAdmin.aadharNumber = adminAadharNumber;
    existingAdmin.password = adminPassword;
    await existingAdmin.save();
    console.log("Existing admin synchronized with configured credentials");
    return;
  }

  const admin = new User({
    name: adminName,
    email: adminEmail,
    aadharNumber: adminAadharNumber,
    password: adminPassword,
    role: "admin",
  });

  await admin.save();
  console.log("Default admin account created");
};

module.exports = bootstrapAdmin;
