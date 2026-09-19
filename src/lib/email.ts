import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import type { Lead } from "./types";

interface GenericEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  fromName?: string;
}

/**
 * Universal email dispatcher:
 * 1. Checks Resend if RESEND_API_KEY is configured.
 * 2. Falls back to Nodemailer (Gmail / custom SMTP) if credentials are provided.
 */
export async function sendEmail({
  to,
  subject,
  htmlContent,
  fromName = "LazyFlow",
}: GenericEmailParams): Promise<{ sent: boolean; provider?: string; error?: string }> {
  // 1. Try Gmail / Nodemailer first (no domain verification restrictions)
  const rawUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpUser = rawUser ? rawUser.trim() : "";
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

      const info = await transporter.sendMail({
        from: `"${fromName}" <${smtpUser}>`,
        to: to.trim(),
        subject,
        html: htmlContent,
      });

      console.log(`[Email Success] Sent to ${to} via ${isGmail ? "Gmail" : "SMTP"}. ID: ${info.messageId}`);
      return { sent: true, provider: isGmail ? "gmail" : "smtp" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email Error] Gmail/SMTP attempt error:", message);
    }
  }

  // 2. Fallback to Resend if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || `${fromName} <onboarding@resend.dev>`;
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to.trim()],
        subject,
        html: htmlContent,
      });

      if (error) {
        console.error("[Email Error] Resend error:", error);
      } else {
        console.log(`[Email Success] Sent to ${to} via Resend. ID: ${data?.id}`);
        return { sent: true, provider: "resend" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email Exception] Resend exception:", message);
    }
  }

  return {
    sent: false,
    error: "No email provider configured or all providers failed (check GMAIL_USER/GMAIL_APP_PASSWORD).",
  };
}

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
            <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; tracking: 1px; margin-top: 4px;">Business Automation</p>
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

  return sendEmail({
    to,
    subject: "Reset Your LazyFlow Admin Password",
    htmlContent,
    fromName: "LazyFlow Security",
  });
}

/**
 * Instant notification sent to Admin whenever a new lead arrives
 */
export async function sendNewLeadAdminNotification(lead: Lead): Promise<{ sent: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || siteConfig.email;
  const rawPhone = lead.phone.replace(/[^\d]/g, "");
  const waLink = rawPhone ? `https://wa.me/${rawPhone}` : "#";
  const portalLeadUrl = `${siteConfig.url}/admin/leads/${lead.id}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Lead Notification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 32px 16px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px;">
            <div>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">⚡ New Lead Received</h1>
              <p style="color: #087BFF; font-size: 13px; font-weight: 600; margin-top: 4px;">Source: ${lead.source || "Website Form"}</p>
            </div>
            <span style="background: rgba(8, 123, 255, 0.15); color: #38bdf8; border: 1px solid rgba(8, 123, 255, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
              ${lead.status || "New"}
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; width: 35%;">Client Name:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Business:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${lead.business || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Phone / WhatsApp:</td>
              <td style="padding: 8px 0; color: #38bdf8; font-size: 14px; font-weight: 600;">
                <a href="${waLink}" style="color: #10b981; text-decoration: none;">${lead.phone} (WhatsApp Chat ↗)</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Email:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">
                ${lead.email ? `<a href="mailto:${lead.email}" style="color: #38bdf8; text-decoration: none;">${lead.email}</a>` : "—"}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">Industry:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${lead.industry || "—"}</td>
            </tr>
          </table>

          <div style="background-color: #182234; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase;">Problem Facing:</p>
            <p style="margin: 0 0 14px 0; font-size: 14px; color: #e2e8f0; line-height: 1.5;">${lead.problem || "Not specified"}</p>
            
            ${
              lead.process
                ? `<p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase;">Time-Consuming Process:</p>
                   <p style="margin: 0; font-size: 14px; color: #e2e8f0; line-height: 1.5;">${lead.process}</p>`
                : ""
            }
          </div>

          <div style="text-align: center; margin: 28px 0 12px 0;">
            <a href="${portalLeadUrl}" style="display: inline-block; background: #087BFF; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 10px;">
              Open in LazyFlow Admin ↗
            </a>
          </div>

          <div style="border-top: 1px solid #1f2937; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #6b7280;">
            Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST • LazyFlow Lead Automation
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `⚡ New Lead: ${lead.name} (${lead.business || lead.industry || "Enquiry"})`,
    htmlContent,
    fromName: "LazyFlow Leads Alert",
  });
}

/**
 * Auto-acknowledgement email sent to client confirming we received their inquiry
 */
export async function sendLeadAutoAcknowledgement(lead: Lead): Promise<{ sent: boolean; error?: string }> {
  if (!lead.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return { sent: false, error: "No valid client email provided" };
  }

  const firstName = lead.name.trim().split(" ")[0];
  const waContactLink = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `Hi LazyFlow team, I submitted an inquiry for ${lead.business || "my business"}.`
  )}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Thank You for Contacting LazyFlow</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 24px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">LazyFlow</h1>
            <p style="color: #9ca3af; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Business Automation, Done Properly.</p>
          </div>

          <div style="background-color: #1f2937; height: 1px; margin-bottom: 24px;"></div>

          <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 12px;">
            Thank you, ${firstName}!
          </h2>
          
          <p style="font-size: 14px; line-height: 24px; color: #9ca3af; margin-bottom: 20px;">
            We&apos;ve received your inquiry regarding business automation${lead.business ? ` for <strong>${lead.business}</strong>` : ""}.
          </p>

          <div style="background-color: #182234; border-left: 3px solid #087BFF; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #e2e8f0; line-height: 20px;">
              <strong>What happens next:</strong> Our automation team is reviewing your requirements and will connect with you via WhatsApp or Email within 24 business hours to discuss the tailored solution.
            </p>
          </div>

          <p style="font-size: 13px; line-height: 22px; color: #9ca3af; margin-bottom: 28px;">
            Need an immediate response or want to share additional details? Chat with us directly on WhatsApp:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${waContactLink}" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">
              Chat on WhatsApp Directly →
            </a>
          </div>

          <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #4b5563;">
            © ${new Date().getFullYear()} LazyFlow. ${siteConfig.domain}<br>
            If you did not submit this request, you can safely ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: lead.email,
    subject: `Thank you for contacting LazyFlow — We received your inquiry`,
    htmlContent,
    fromName: "LazyFlow Team",
  });
}
