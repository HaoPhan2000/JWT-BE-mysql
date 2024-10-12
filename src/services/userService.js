require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const otpService = require("./otpService");
const db = require("../config/dbConfig");
class CustomMessageEC {
  constructor(EC, EM) {
    this.EC = EC;
    this.EM = EM;
  }
}
class CustomMessage {
  constructor(EM) {
    this.EM = EM;
  }
}
function findOne(query){
  if (query.length === 0) {
   return undefined
  }
  return query[0]
}
const registerService = async (customerData) => {
  try {
    const [user] =findOne( await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [customerData.email]
    ));
    if (user) {
      throw new CustomMessage("Email đã tồn tại");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const isValid = emailRegex.test(customerData.email);
    if (!isValid) {
      throw new CustomMessage("Tài khoản phải đúng định dạng đuôi @gmail.com");
    }
    return new CustomMessage("Thành công");
  } catch (error) {
    throw error;
  }
};
const verifyOtpregisterService = async ({ otp, dataUser }) => {
  try {
    await otpService.verify({ otp, email: dataUser.email });
    const hashPassWord = await bcrypt.hash(dataUser.password, saltRounds);
    await db.query("INSERT INTO users (name,email,password) VALUES (?,?,?)", [
      dataUser.name,
      dataUser.email,
      hashPassWord,
    ]);
    await db.query("DELETE FROM otps WHERE email = ?", [dataUser.email]);
    return new CustomMessageEC(1, "Đăng ký tài khoản thành công");
  } catch (error) {
    if (error?.EC === 102) {
      await db.query("DELETE FROM otps WHERE email = ?", [dataUser.email]);
    }
    throw error;
  }
};
const loginCustomerService = async (customerData) => {
  try {
    const [user] = findOne(await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [
      customerData.email,
    ]));
    console.log(user)
    if (!user) {
      throw new CustomMessageEC(103, "Email/Password không hợp lệ");
    }
    const isMatchPassWord = await bcrypt.compare(
      customerData.password,
      user.password
    );
    if (!isMatchPassWord) {
      throw new CustomMessageEC(102, "Email/Password không hợp lệ");
    }
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const access_token = jwt.sign(payload, process.env.Private_KeyAccessToken, {
      expiresIn: process.env.Time_JwtAccessToken,
    });
    const refresh_token = jwt.sign(
      payload,
      process.env.Private_KeyRefreshToken,
      {
        expiresIn: process.env.Time_JwtRefreshToken,
      }
    );
    await db.query("UPDATE users SET refreshToken = ? WHERE id = ?", [
      refresh_token,
      user.id,
    ]);
    return { EC: 1, EM: "Đăng nhập thành công", access_token, refresh_token };
  } catch (error) {
    throw error;
  }
};
const forgotPasswordService = async (customerData) => {
  try {
    const [user] =findOne( await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [
        customerData.email
      ]));
    if (!user) {
      throw new CustomMessage("Không tìm thấy địa chỉ email");
    }
    const secret = process.env.Private_KeyResetPassword + user.password;
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(payload, secret, {
      expiresIn: process.env.Time_JwtResetPassword,
    });
    const link = `${process.env.Domain}/reset-password?user_id=${user.id}&token=${token}`;
    return link;
  } catch (error) {
    throw error;
  }
};
const resetPasswordService = async (dataUser) => {
  const { user_id, token, password } = dataUser;
  try {
    const [user] =findOne( await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [
        user_id
      ]));
      console.log(user)
    if (!user) {
      throw new CustomMessage("Không tìm thấy user");
    }
    const secret = process.env.Private_KeyResetPassword + user.password;
    const payload = jwt.verify(token, secret);
    const hashPassWord = await bcrypt.hash(password, saltRounds);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashPassWord,
        payload.id
      ]);
    return new CustomMessage("Đặt lại mật khẩu thành công");
  } catch (error) {
    throw error;
  }
};
const getUserService = async () => {
  try {
    console.log("ok")
    const [rank] = await db.query("SELECT name,email,score FROM users");
    console.log(rank)
    if (!rank) throw new CustomMessage("không tìm thấy bảng xếp hạng");
    return rank;
  } catch (error) {
    throw error;
  }
};
const refreshTokenService = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error("You are not authenticated");
    }
    const payload = jwt.verify(
      refreshToken,
      process.env.Private_KeyRefreshToken
    );
    const [user] = findOne(await db.query("SELECT * FROM users WHERE id = ? LIMIT 1", [
      payload.id,
    ]));
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid token");
    }

    const newAccessToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.Private_KeyAccessToken,
      { expiresIn: process.env.Time_JwtAccessToken }
    );

    const newRefreshToken = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        name: payload.name,
      },
      process.env.Private_KeyRefreshToken,
      {
        expiresIn: process.env.Time_JwtRefreshToken,
      }
    );
    await db.query("UPDATE users SET refreshToken = ? WHERE id = ?", [
      newRefreshToken,
      payload.id,
    ]);
    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  resetPasswordService,
  forgotPasswordService,
  refreshTokenService,
  registerService,
  loginCustomerService,
  getUserService,
  verifyOtpregisterService,
};
