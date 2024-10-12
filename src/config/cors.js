require("dotenv").config();
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = [process.env.Domain];

    if (!origin || whitelist.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new ApiError(
        StatusCodes.FORBIDDEN,
        `${origin} not allowed by our CORS Policy.`
      )
    );
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;