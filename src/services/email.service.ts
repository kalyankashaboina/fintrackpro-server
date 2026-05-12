import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../config/logger.js';
import { IEmailOptions } from '../types/express.types.js';

const isEmailConfigured =
  env.EMAIL_USER &&
  env.EMAIL_USER !== 'your-email@gmail.com' &&
  env.EMAIL_PASSWORD;

class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (isEmailConfigured) {
      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT,
        secure: env.EMAIL_PORT === 465,
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
      });
      this.verifyConnection();
    } else {
      logger.warn('Email not configured — email sending disabled in dev. Set EMAIL_USER + EMAIL_PASSWORD in .env to enable.');
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter?.verify();
      logger.info('Email service ready');
    } catch (error) {
      logger.warn({ err: error }, 'Email service connection check failed (non-fatal in dev)');
    }
  }

  async sendEmail(options: IEmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.info({ to: options.to, subject: options.subject }, '[DEV] Email skipped (not configured)');
      return true;
    }
    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM || env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      logger.info({ to: options.to, subject: options.subject }, 'Email sent');
      return true;
    } catch (error) {
      logger.error({ err: error }, 'Email send failed');
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
    logger.info({ email, url }, '[DEV] Verification email — token for testing');
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email — FinTrackPro',
      html: `<p>Hi ${name}, <a href="${url}">Click here to verify your email</a>. Link: ${url}</p>`,
      text: `Hi ${name}, verify your email: ${url}`,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const url = `${env.CLIENT_URL}/reset-password/${token}`;
    logger.info({ email, url }, '[DEV] Password reset email — token for testing');
    return this.sendEmail({
      to: email,
      subject: 'Password Reset — FinTrackPro',
      html: `<p>Hi ${name}, <a href="${url}">Reset your password</a>. Link: ${url}</p>`,
      text: `Hi ${name}, reset your password: ${url}`,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to FinTrackPro!',
      html: `<p>Hi ${name}, welcome to FinTrackPro! Start tracking your finances today.</p>`,
      text: `Hi ${name}, welcome to FinTrackPro!`,
    });
  }
}

export default new EmailService();
