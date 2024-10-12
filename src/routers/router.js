const router = require("express").Router();
const Controller = require("../controllers/controller");
const authentication = require("../middleware/authentication");
router.all("*", authentication);
router.post("/v1/api/register", Controller.register);
router.post("/v1/api/confirmOtp", Controller.verifyOtpRegister);
router.post("/v1/api/login", Controller.login);
router.put("/v1/api/refresh", Controller.refreshToken);
router.post("/v1/api/forgotPassword", Controller.forgotPassword);
router.post("/v1/api/resetPassword",Controller.resetPassword)
router.put("/v1/api/logout", Controller.logout);
router.get("/v1/api/account", Controller.account);
router.get("/v1/api/rank", Controller.rank);
module.exports = router;
