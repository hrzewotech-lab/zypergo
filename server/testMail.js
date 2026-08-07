require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log("Verifying connection...");
    await transporter.verify();
    console.log("Connection verified successfully!");

    const info = await transporter.sendMail({
      from: '"ZyperGo Logistics" <noreply@zypergo.com>',
      to: process.env.SMTP_USER, // Send to self
      subject: "Test Mail",
      html: "<p>This is a test</p>",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
