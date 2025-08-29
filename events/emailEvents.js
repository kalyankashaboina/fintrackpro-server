const EventEmitter = require('events');
class EmailEmitter extends EventEmitter {}
const emailEmitter = new EmailEmitter();

const sendMail = require('../utils/nodemailer');
const { registrationSuccessTemplate, forgotPasswordTemplate, loginNotificationTemplate } = require('../utils/emailTemplates');

emailEmitter.on('sendRegistrationEmail', async ({ email, name }) => {
  try {
    await sendMail({
      to: email,
      subject: 'Welcome to FinTrackPro!',
      html: registrationSuccessTemplate(name),
    });
    console.log('Registration email sent to:', email);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
});

emailEmitter.on('sendForgotPasswordEmail', async ({ email, name, resetLink }) => {
  try {
    console.log("Sending forgot password email to:", email);
    console.log("Reset link:", resetLink);
    console.log("Name:", name);

    await sendMail({
      to: email,
      subject: 'Reset Your Password - FinTrackPro',
      html: forgotPasswordTemplate(name, resetLink),
    });
    console.log('Forgot password email sent to:', email);
  } catch (error) {
    console.error('Error sending forgot password email:', error);
  }
});
emailEmitter.on('sendLoginNotificationEmail', async ({ email, name }) => {
  try {
    await sendMail({
      to: email,
      subject: 'New Sign-In to Your FinTrackPro Account',
      html: loginNotificationTemplate(name),
    });
    logger.info(`Login notification email sent to: ${email}`);
  } catch (error) {
    logger.error(`Error sending login notification email to ${email}:`, error);
  }
});

module.exports = emailEmitter;
