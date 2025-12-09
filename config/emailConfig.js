

const emailConfig = {

  from: process.env.GMAIL_FROM || 'your-email@gmail.com',
  

  gmailPassword: process.env.GMAIL_PASSWORD || 'your-app-password',
  

  feedbackRecipient: process.env.FEEDBACK_RECIPIENT || 'vivek@gmail.com'
}

module.exports = emailConfig
