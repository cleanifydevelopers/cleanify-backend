const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const Feedback = require("../models/Feedback");

console.log("Feedback route loaded");
console.log("Gmail User:", process.env.GMAIL_USER);

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error(" Gmail SMTP Error:", error.message);
  } else {
    console.log(" Gmail SMTP Connected");
  }
});

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

    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
      subject: `New Feedback from ${name} - ${category}`,
      html: `<h2>New Feedback Received</h2><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Category:</strong> ${category}</p><hr/><p><strong>Message:</strong> ${feedback || "No additional message"}</p>`
    };

    const userMailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Thank you for your feedback - Cleanify",
      html: `<h2>Thank You for Your Feedback!</h2><p>Dear ${name},</p><p>We have received your feedback and truly appreciate you taking the time to share your thoughts with us.</p><p><strong>Your Feedback:</strong> ${feedback || "Rating submission"}</p><p>We will use this to improve Cleanify!</p><p>Best regards,<br/>The Cleanify Team </p>`
    };

    try {
      console.log(" Sending admin email to:", process.env.ADMIN_EMAIL);
      const adminResponse = await transporter.sendMail(adminMailOptions);
      console.log(" Admin email sent successfully. MessageID:", adminResponse.messageId);
    } catch (adminErr) {
      console.error("  ADMIN EMAIL ERROR:", adminErr.message);
      console.error("Error code:", adminErr.code);
      console.error("SMTP response:", adminErr.response);
    }

    try {
      console.log(" Sending user confirmation email to:", email);
      const userResponse = await transporter.sendMail(userMailOptions);
      console.log(" User email sent successfully. MessageID:", userResponse.messageId);
    } catch (userErr) {
      console.error("  USER EMAIL ERROR:", userErr.message);
      console.error("Error code:", userErr.code);
      console.error("SMTP response:", userErr.response);
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
