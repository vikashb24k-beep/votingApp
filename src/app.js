const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { createCorsOptions } = require("./config/corsOptions");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandlers");

const app = express();

app.use(cors(createCorsOptions()));
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", authRoutes);
app.use("/", voteRoutes);
app.use("/", profileRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/candidates", candidateRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
