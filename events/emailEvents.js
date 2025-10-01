const EventEmitter = require('events');
class EmailEmitter extends EventEmitter {}
const emailEmitter = new EmailEmitter();

const sendMail = require('../utils/nodemailer');
const {
  registrationSuccessTemplate,
  forgotPasswordTemplate,
  loginNotificationTemplate,
} = require('../utils/emailTemplates');
const logger = require('../utils/logger');

emailEmitter.on('sendRegistrationEmail', async ({ email, name }) => {
  try {
    await sendMail({
      to: email,
      subject: 'Welcome to FinTrackPro!',
      html: registrationSuccessTemplate(name),
    });
    logger.info('Registration email sent to:', email);
  } catch (error) {
    logger.error('Error sending registration email:', error);
  }
});

emailEmitter.on('sendForgotPasswordEmail', async ({ email, name, resetLink }) => {
  try {
    logger.info('Sending forgot password email to:', email);
    logger.info('Reset link:', resetLink);
    logger.info('Name:', name);

    await sendMail({
      to: email,
      subject: 'Reset Your Password - FinTrackPro',
      html: forgotPasswordTemplate(name, resetLink),
    });
    logger.info('Forgot password email sent to:', email);
  } catch (error) {
    logger.error('Error sending forgot password email:', error);
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
