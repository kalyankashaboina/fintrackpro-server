const EventEmitter = require('events');
class EmailEmitter extends EventEmitter {}
const emailEmitter = new EmailEmitter();

const sendMail = require('../utils/nodemailer');
const { registrationSuccessTemplate, forgotPasswordTemplate } = require('../utils/emailTemplates');

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

module.exports = emailEmitter;
