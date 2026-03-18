require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const bootstrapAdmin = require("./src/config/bootstrapAdmin");
const ensureIndexes = require("./src/config/ensureIndexes");
const repairUserIndexes = require("./src/scripts/repairUserIndexes");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  await connectDatabase();
  await repairUserIndexes();
  await ensureIndexes();
  await bootstrapAdmin();

  app.listen(PORT, () => {
    console.log(`Voting API listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
