const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBookingNotification = async (booking, listing, user) => {
  try {
    console.log("📨 Sending emails...");

    // ================= USER EMAIL =================
    const userEmail = await resend.emails.send({
      from: "Wanderlust <onboarding@resend.dev>",
      to: "prathm2112@gmail.com", // demo mode
      subject: "Booking Confirmed 🎉",
      html: `
        <h2>Booking Confirmed</h2>
        <p>Your booking for <b>${listing.title}</b> is confirmed.</p>
        <p>Check-in: ${booking.checkIn}</p>
        <p>Check-out: ${booking.checkOut}</p>
      `,
    });

    // ================= OWNER EMAIL =================
    const ownerEmail = await resend.emails.send({
      from: "Wanderlust <onboarding@resend.dev>",
      to: "prathm2112@gmail.com", // demo mode (IMPORTANT)
      subject: "New Booking Received 🏡",
      html: `
        <h2>New Booking Alert</h2>
        <p>Your listing <b>${listing.title}</b> has been booked.</p>
        <p><b>Guest:</b> ${user.username || "User"}</p>
        <p><b>Check-in:</b> ${booking.checkIn}</p>
        <p><b>Check-out:</b> ${booking.checkOut}</p>
        <p><b>Total:</b> ₹${booking.totalPrice}</p>
      `,
    });

    console.log("📩 User email:", userEmail.data);
    console.log("📩 Owner email:", ownerEmail.data);

  } catch (err) {
    console.error("❌ Email error:");
    console.error(err);
    throw err;
  }
};

module.exports = { sendBookingNotification };