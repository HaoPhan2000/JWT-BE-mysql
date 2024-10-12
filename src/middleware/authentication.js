require("dotenv").config();
const jwt = require("jsonwebtoken");
const authen = (req, res, next) => {
  const allowList = ["/", "register","confirmOtp", "login", "refresh","forgotPassword","resetPassword","rank"];
  if (allowList.find((item) => `/v1/api/${item}` === req.originalUrl)) {
    return next();
  }
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json("error");
  }
  try {
    const user = jwt.verify(token, process.env.Private_KeyAccessToken);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json("error");
  }
};

module.exports = authen;
