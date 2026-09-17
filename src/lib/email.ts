import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface SendResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendResetEmailParams): Promise<{ sent: boolean; provider?: string; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your LazyFlow Password</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">LazyFlow</h1>
            <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; tracking: 1px; margin-top: 4px;">Business Automation Studio</p>
          </div>

          <div style="background-color: #1f2937; height: 1px; margin-bottom: 28px;"></div>

          <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 12px;">Reset Your Admin Password</h2>
          
          <p style="font-size: 14px; line-height: 24px; color: #9ca3af; margin-bottom: 24px;">
            We received a request to reset your password for your <strong>LazyFlow Admin Portal</strong> account. Click the button below to choose a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #087BFF 0%, #00d2ff 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(8, 123, 255, 0.4);">
              Reset Password →
            </a>
          </div>

          <p style="font-size: 12px; line-height: 20px; color: #6b7280; margin-bottom: 20px;">
            This link is valid for <strong>30 minutes</strong> and can only be used once. If you did not request this password reset, please disregard this email.
          </p>

          <div style="background-color: #182234; border-radius: 12px; padding: 12px 16px; word-break: break-all; font-size: 11px; color: #9ca3af; margin-top: 24px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #38bdf8; text-decoration: underline;">${resetUrl}</a>
          </div>

          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #4b5563;">
            © ${new Date().getFullYear()} LazyFlow. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // 1. Try Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "LazyFlow Security <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: "Reset Your LazyFlow Admin Password",
        html: htmlContent,
      });

      if (error) {
        console.warn("Resend email error:", error);
      } else {
        return { sent: true, provider: "resend" };
      }
    } catch (err) {
      console.warn("Resend exception:", err);
    }
  }

  // 2. Try Nodemailer if SMTP/Gmail credentials are configured
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpPass = rawPass ? rawPass.replace(/\s+/g, "") : "";

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST;
      const isGmail = !host || host.toLowerCase().includes("gmail");

      const transporter = nodemailer.createTransport(
        isGmail
          ? {
              service: "gmail",
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
          : {
              host: host || "smtp.gmail.com",
              port: parseInt(process.env.SMTP_PORT || "587", 10),
              secure: process.env.SMTP_PORT === "465",
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            }
      );

      await transporter.sendMail({
        from: `"LazyFlow Security" <${smtpUser}>`,
        to,
        subject: "Reset Your LazyFlow Admin Password",
        html: htmlContent,
      });

      return { sent: true, provider: isGmail ? "gmail" : "smtp" };
    } catch (err) {
      console.warn("SMTP email error:", err);
      return { sent: false, error: String(err) };
    }
  }

  // If no email service is configured yet
  return {
    sent: false,
    error: "No email service configured (Add GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY in Vercel settings).",
  };
}
