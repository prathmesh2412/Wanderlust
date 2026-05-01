const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingNotification = async (booking, listing, user) => {
  try {
    console.log("📨 Sending email via Resend...");

    const data = await resend.emails.send({
      from: "Wanderlust <onboarding@resend.dev>",
      to: "prathm2112@gmail.com",
      subject: "Booking Confirmed 🎉",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Hello ${user.username || "User"},</p>
        <p>Your booking for <b>${listing.title}</b> is confirmed.</p>
        <p><b>Check-in:</b> ${booking.checkIn}</p>
        <p><b>Check-out:</b> ${booking.checkOut}</p>
        <p><b>Total:</b> ₹${booking.totalPrice}</p>
      `,
    });

    console.log("📩 Email sent:", data);

    return data;

  } catch (err) {
    console.error("❌ Email error:");
    console.error(err);
    throw err;
  }
};

module.exports = { sendBookingNotification };