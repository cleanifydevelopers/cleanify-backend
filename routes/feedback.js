const express = require("express");
const sgMail = require("@sendgrid/mail");
const router = express.Router();
const Feedback = require("../models/Feedback");

console.log("Feedback route loaded");
console.log("SendGrid API Key configured:", !!process.env.SENDGRID_API_KEY);

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// POST /api/send-feedback - Send feedback and email
router.post("/", async (req, res) => {
  console.log(" FEEDBACK REQUEST RECEIVED");
  console.log("Request body:", req.body);

  try {
    const { name, email, category, feedback, timestamp } = req.body;
    console.log(" Feedback submission received:", { name, email, category });

    if (!name || !email) {
      console.log(" ERROR: Missing name or email");
      return res.status(400).json({ error: "Name and email are required" });
    }

    const newFeedback = new Feedback({
      name,
      email,
      category,
      feedback,
      timestamp: timestamp || new Date()
    });

    await newFeedback.save();
    console.log(" Feedback saved to DB:", newFeedback._id);

    const senderEmail = process.env.SENDGRID_FROM_EMAIL || process.env.GMAIL_USER || "noreply@cleanify.com";
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || "admin@cleanify.com";

    const adminMailOptions = {
      to: adminEmail,
      from: senderEmail,
      subject: `New Feedback from ${name} - ${category}`,
      html: `<h2>New Feedback Received</h2><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Category:</strong> ${category}</p><hr/><p><strong>Message:</strong> ${feedback || "No additional message"}</p>`
    };

    const userMailOptions = {
      to: email,
      from: senderEmail,
      subject: "Thank you for your feedback - Cleanify",
      html: `<h2>Thank You for Your Feedback!</h2><p>Dear ${name},</p><p>We have received your feedback and truly appreciate you taking the time to share your thoughts with us.</p><p><strong>Your Feedback:</strong> ${feedback || "Rating submission"}</p><p>We will use this to improve Cleanify!</p><p>Best regards,<br/>The Cleanify Team</p>`
    };

    try {
      console.log(" Sending admin email to:", adminEmail);
      await sgMail.send(adminMailOptions);
      console.log(" Admin email sent successfully");
    } catch (adminErr) {
      console.error("  ADMIN EMAIL ERROR:", adminErr.message);
      if (adminErr.response) {
        console.error("SendGrid Error:", adminErr.response.body);
      }
    }

    try {
      console.log(" Sending user confirmation email to:", email);
      await sgMail.send(userMailOptions);
      console.log(" User email sent successfully");
    } catch (userErr) {
      console.error("  USER EMAIL ERROR:", userErr.message);
      if (userErr.response) {
        console.error("SendGrid Error:", userErr.response.body);
      }
    }

    res.json({
      ok: true,
      message: "Feedback submitted successfully! A confirmation email has been sent.",
      feedbackId: newFeedback._id
    });
  } catch (err) {
    console.error("  Feedback Error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ error: err.message || "Failed to submit feedback" });
  }
});

router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ timestamp: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Failed to get feedback" });
  }
});

module.exports = router;
