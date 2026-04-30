const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send booking notification email to listing owner
 * @param {Object} booking - Booking object
 * @param {Object} listing - Listing object
 * @param {Object} user - User object
 */
const sendBookingNotification = async (booking, listing, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: listing.owner.email, // Assuming listing has owner with email
      subject: `New Booking for ${listing.title}`,
      html: `
        <h2>New Booking Notification</h2>
        <p><strong>Listing:</strong> ${listing.title}</p>
        <p><strong>Booked by:</strong> ${user.username}</p>
        <p><strong>Check-in:</strong> ${booking.checkIn.toDateString()}</p>
        <p><strong>Check-out:</strong> ${booking.checkOut.toDateString()}</p>
        <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
        <p>Please prepare for the guest's arrival.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking notification email sent successfully');
  } catch (error) {
    console.error('Error sending booking notification email:', error);
    // Don't throw error to avoid breaking booking flow
  }
};

module.exports = { sendBookingNotification };