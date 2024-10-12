const {
  resetPasswordService,
  forgotPasswordService,
  refreshTokenService,
  registerService,
  loginCustomerService,
  getUserService,
  verifyOtpregisterService,
} = require("../services/userService");
const fs = require("fs");
const otpService = require("../services/otpService");
const sendEmailService = require("../services/EmailService");
const text = require("../constants/text");
const Controller = {
  register: async (req, res) => {
    try {
      const { email } = req.body;
      await registerService({
        email: email,
      });
      const otp = await otpService.get(email);
      if (otp.code === 0) {
        throw new Error("Tạo otp thất bại");
      }
      const template = fs.readFileSync("views/emaiOTP.ejs", "utf-8");
      await sendEmailService(
        email,
        {
          title: "Đăng ký tài khoản",
          content: text.mailregisterContent,
          OTP: otp.otp,
        },
        template
      );
      res.status(200).json("thành công");
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  },
  sendMail: async (req, res) => {
    try {
      const sendMail = sendEmailService(req.data);
      if (sendMail) {
        res.status(200).json("gửi mail thành công");
      } else {
        res.status(400).json("gửi mail thất bại");
      }
    } catch (error) {
      res.status(400).json(error);
    }
  },
  verifyOtpRegister: async (req, res) => {
    try {
      const { otp, dataUser } = req.body;
      const register = await verifyOtpregisterService({ otp, dataUser });
      res.status(200).json(register);
    } catch (error) {
      res.status(400).json(error);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const service = await loginCustomerService({ email, password });
      res.cookie(text.refreshTokenName, service.refresh_token, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json(service);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  refreshToken: async (req, res) => {
    try {
      const refresh_token = req.cookies.refreshToken;
      const newToken = await refreshTokenService(refresh_token);
      res.cookie(text.refreshTokenName, newToken.newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ newAccessToken: newToken.newAccessToken });
    } catch (error) {
      console.log(error);
      res.clearCookie(text.refreshTokenName);
      return res.status(401).json(error);
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const link = await forgotPasswordService({
        email: email,
      });
      const template = fs.readFileSync("views/forgetPassword.ejs", "utf-8");
      await sendEmailService(
        email,
        {
          title: "Khôi phục mật khẩu",
          content: text.mailForgotPassword,
          link,
        },
        template
      );
      res
        .status(200)
        .json({
          EM: "Vui lòng truy cập địa chỉ gmail hoàn tất cập nhật mật khẩu",
        });
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  },
  resetPassword: async (req, res) => {
    const { user_id,token,password } = req.body;
    try {
      const reset=await resetPasswordService({
        user_id,token,password
      })
      
      res.status(200).json(reset);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  
  },
  logout: async (req, res) => {
    try {
      await db.query("UPDATE users SET refreshToken = ? WHERE id = ?", [
        null,
        req?.user?.id,
      ]);
      res.clearCookie(text.refreshTokenName, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      res.status(200).json("thành công");
    } catch (error) {
      res.status(400).json(error);
    }
  },
  account: async (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      res.status(401).json(error);
    }
  },

  rank: async (req, res) => {
    try {
      const data = await getUserService();
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json(error);
    }
  },
}
module.exports = Controller;
