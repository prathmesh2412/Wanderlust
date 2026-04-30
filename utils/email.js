const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingNotification = async (booking, listing, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: listing.owner.email,
      subject: `New Booking for ${listing.title}`,
      html: `
        <h2>New Booking</h2>
        <p><b>Listing:</b> ${listing.title}</p>
        <p><b>User:</b> ${user.username}</p>
        <p><b>Check-in:</b> ${booking.checkIn.toDateString()}</p>
        <p><b>Check-out:</b> ${booking.checkOut.toDateString()}</p>
        <p><b>Total:</b> ₹${booking.totalPrice}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

module.exports = { sendBookingNotification };