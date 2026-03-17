require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const bootstrapAdmin = require("./src/config/bootstrapAdmin");
const repairUserIndexes = require("./src/scripts/repairUserIndexes");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDatabase();
  await repairUserIndexes();
  await bootstrapAdmin();

  app.listen(PORT, () => {
    console.log(`Voting API listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
