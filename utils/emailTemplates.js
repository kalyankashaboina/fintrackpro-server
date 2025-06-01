// emailTemplates.js

const forgotPasswordTemplate = (userName, resetLink) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
    <h2 style="color: #2c3e50;">Hello ${userName},</h2>
    <p>You requested to reset your password for <strong>FinTrackPro</strong>.</p>
    <p>Please click the button below to reset your password:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" 
         style="
           background-color: #1a73e8; 
           color: #ffffff; 
           padding: 12px 24px; 
           text-decoration: none; 
           border-radius: 4px; 
           display: inline-block;
           font-weight: bold;
         "
         target="_blank" 
         rel="noopener noreferrer"
      >
        Reset Password
      </a>
    </p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <br />
    <p>Thanks,<br/>The FinTrackPro Team</p>
    <hr style="border:none; border-top:1px solid #ddd; margin-top:40px;"/>
    <p style="font-size: 12px; color: #999;">
      FinTrackPro Inc.<br/>
      If you have any questions, reply to this email.
    </p>
  </div>
`;

const registrationSuccessTemplate = (userName) => `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
    <h2 style="color: #2c3e50;">Welcome to FinTrackPro, ${userName}!</h2>
    <p>Thank you for registering. We're excited to have you on board.</p>
    <p>If you have any questions or need help, feel free to reply to this email or visit our support page.</p>
    <br />
    <p>Best regards,<br/>The FinTrackPro Team</p>
    <hr style="border:none; border-top:1px solid #ddd; margin-top:40px;"/>
    <p style="font-size: 12px; color: #999;">
      FinTrackPro Inc.<br/>
      Your trusted finance app.
    </p>
  </div>
`;

module.exports = { forgotPasswordTemplate, registrationSuccessTemplate };
