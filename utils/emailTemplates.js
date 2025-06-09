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
    <h2 style="color: #2c3e50;">Welcome aboard, ${userName}!</h2>
    <p>We're thrilled to have you join <strong>FinTrackPro</strong>, your new go-to platform for managing finances with confidence.</p>
    <p>To help you get started, here are a few things you can do:</p>
    <ul style="padding-left: 20px; line-height: 1.6;">
      <li>Explore your personalized dashboard</li>
      <li>Set your financial goals</li>
      <li>Track spending and investments in real-time</li>
    </ul>
    <p>If you ever need help, our support team is just a click away.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="https://fintrackpro-three.vercel.app/login" 
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
        Go to Your Account
      </a>
    </p>
    <p>Thanks for joining us—we can't wait to see what you'll achieve!</p>
    <br />
    <p>Best regards,<br/>The FinTrackPro Team</p>
    <hr style="border:none; border-top:1px solid #ddd; margin-top:40px;"/>
    <p style="font-size: 12px; color: #999;">
      FinTrackPro Inc.<br/>
      Your trusted finance companion. Need help? Just reply to this email.
    </p>
  </div>
`;

module.exports = { forgotPasswordTemplate, registrationSuccessTemplate };
