const parseAllowedOrigins = () =>
  String(process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

const createCorsOptions = () => {
  const allowedOrigins = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  };
};

module.exports = {
  parseAllowedOrigins,
  isOriginAllowed,
  createCorsOptions,
};
