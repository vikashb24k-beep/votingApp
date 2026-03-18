const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    const error = new Error("Email delivery is not configured");
    error.statusCode = 500;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return transporter;
};

const sendOtpEmail = async (email, otp) => {
  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your VoteSphere OTP",
    text: `Your VoteSphere verification code is ${otp}. It expires in 5 minutes.`,
  });
};

module.exports = {
  sendOtpEmail,
};
