const nodemailer = require("nodemailer");
const ejs = require("ejs");
require("dotenv").config();

const sendEmailService = async (email, attached,template) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email_UserName,
        pass: process.env.Email_PassWord,
      },
    });

    // Render template bằng EJS với dữ liệu
    const html = ejs.render(template, {attached});

    // Gửi email
    await transporter.sendMail({
      from: `${attached.title} <${process.env.Email_UserName}>`, // Địa chỉ email người gửi
      to: email, // Địa chỉ email người nhận
      subject: attached.title, // Chủ đề email
      html: html, // Nội dung HTML của email
    });

    return true;
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error;
  }
};

module.exports = sendEmailService;
