// Email configuration
// Note: You need to configure this with your Gmail account details

const emailConfig = {
  // Gmail account that will send the feedback
  from: process.env.GMAIL_FROM || 'your-email@gmail.com',
  
  // Gmail App Password (NOT your regular password)
  // Generate one at: https://myaccount.google.com/apppasswords
  gmailPassword: process.env.GMAIL_PASSWORD || 'your-app-password',
  
  // Where to send feedback (can be same as from or different)
  feedbackRecipient: process.env.FEEDBACK_RECIPIENT || 'vivek@gmail.com'
}

module.exports = emailConfig
