const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URL_LOCAL || process.env.MONGODB_URL;

  if (!mongoUri) {
    throw new Error("MongoDB connection string is missing");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

module.exports = connectDatabase;
