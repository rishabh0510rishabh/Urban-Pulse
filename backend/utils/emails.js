const nodemailer = require("nodemailer");

async function sendEmail(to, subject, html) {
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER.includes("your_email") ||
    !process.env.EMAIL_PASS
  ) {
    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
