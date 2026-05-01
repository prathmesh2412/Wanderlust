const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
  connectionTimeout: 10000, // ⭐ important
});

const sendBookingNotification = async (booking, listing, user) => {
  try {
    console.log("📨 Preparing email...");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Confirmed",
      text: `Your booking is confirmed for ${listing.title}`,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("📩 Email sent result:", result.response);

    return result;
  } catch (err) {
    console.error("❌ EMAIL ERROR FULL:");
    console.error(err);
    throw err;
  }
};

module.exports = { sendBookingNotification };