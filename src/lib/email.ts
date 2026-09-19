import nodemailer from "nodemailer";
import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import type { Lead } from "./types";

interface GenericEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  fromName?: string;
  replyTo?: string;
}

/**
 * Universal email dispatcher optimized for high deliverability (Inbox vs Spam):
 * - Includes both multipart HTML and plain-text fallback (crucial for spam score reduction)
 * - Sets explicit Reply-To and Sender headers
 * - Prioritizes Gmail SMTP when configured, with fallback to Resend
 */
export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
  fromName = "LazyFlow",
  replyTo,
}: GenericEmailParams): Promise<{ sent: boolean; provider?: string; error?: string }> {
  const plainText =
    textContent ||
    htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const effectiveReplyTo = replyTo || process.env.GMAIL_USER || siteConfig.email;

  // 1. Try Gmail / Nodemailer first (no domain verification blocks)
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
        replyTo: effectiveReplyTo,
        subject,
        text: plainText,
        html: htmlContent,
        headers: {
          "X-Entity-Ref-ID": `lf-${Date.now()}`,
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
      });

      console.log(`[Email Success] Delivered to ${to} via ${isGmail ? "Gmail" : "SMTP"}. MessageId: ${info.messageId}`);
      return { sent: true, provider: isGmail ? "gmail" : "smtp" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Email Error] Gmail/SMTP attempt failed:", message);
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
        replyTo: effectiveReplyTo,
        subject,
        text: plainText,
        html: htmlContent,
      });

      if (error) {
        console.error("[Email Error] Resend error:", error);
      } else {
        console.log(`[Email Success] Delivered to ${to} via Resend. ID: ${data?.id}`);
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
        <title>Reset Your LazyFlow Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; margin: 0; padding: 32px 16px;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #087bff; font-size: 22px; font-weight: 700; margin: 0;">LazyFlow</h1>
            <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Business Automation Portal</p>
          </div>
          <h2 style="font-size: 18px; color: #0f172a; margin-bottom: 12px;">Reset Your Admin Password</h2>
          <p style="font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 24px;">
            We received a request to reset your password for the LazyFlow Admin Portal. Click the button below to choose a new password:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #087bff; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; line-height: 18px; color: #64748b;">
            This link is valid for 30 minutes and can only be used once. If you did not request this, you can safely ignore this email.
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            © ${new Date().getFullYear()} LazyFlow. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Reset Your LazyFlow Admin Password

We received a request to reset your password for the LazyFlow Admin Portal.
Use this link within 30 minutes to set your new password:
${resetUrl}

If you did not request this, please ignore this email.
© ${new Date().getFullYear()} LazyFlow`;

  return sendEmail({
    to,
    subject: "Reset Your LazyFlow Admin Password",
    htmlContent,
    textContent,
    fromName: "LazyFlow Security",
  });
}

/**
 * Notification sent to Admin whenever a new lead arrives
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
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px 16px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0;">New Lead Received</h2>
            <p style="color: #087bff; font-size: 13px; font-weight: 600; margin-top: 4px;">Source: ${lead.source || "Website Form"}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 35%;">Client Name:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Business:</td>
              <td style="padding: 6px 0; color: #0f172a;">${lead.business || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Phone / WhatsApp:</td>
              <td style="padding: 6px 0; font-weight: 600;">
                <a href="${waLink}" style="color: #059669; text-decoration: underline;">${lead.phone} (WhatsApp)</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Email:</td>
              <td style="padding: 6px 0; color: #0f172a;">
                ${lead.email ? `<a href="mailto:${lead.email}" style="color: #087bff;">${lead.email}</a>` : "Not provided"}
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Industry:</td>
              <td style="padding: 6px 0; color: #0f172a;">${lead.industry || "General"}</td>
            </tr>
          </table>

          <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Problem / Requirement:</p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e293b; line-height: 1.4;">${lead.problem || "Not specified"}</p>
            ${
              lead.process
                ? `<p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase;">Process:</p>
                   <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.4;">${lead.process}</p>`
                : ""
            }
          </div>

          <div style="text-align: center; margin: 24px 0 12px 0;">
            <a href="${portalLeadUrl}" style="display: inline-block; background-color: #087bff; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 6px;">
              View Lead in Admin Portal →
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
            Received at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST • LazyFlow
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `New Lead Received - LazyFlow

Client: ${lead.name}
Business: ${lead.business || "Not specified"}
Phone: ${lead.phone}
Email: ${lead.email || "Not provided"}
Industry: ${lead.industry || "General"}

Problem / Requirement:
${lead.problem || "Not specified"}

${lead.process ? `Process:\n${lead.process}\n` : ""}
Open in Admin: ${portalLeadUrl}
`;

  return sendEmail({
    to: adminEmail,
    subject: `New Lead: ${lead.name} (${lead.business || lead.industry || "Enquiry"})`,
    htmlContent,
    textContent,
    fromName: "LazyFlow Leads",
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 32px 16px;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #087bff; font-size: 24px; font-weight: 700; margin: 0;">LazyFlow</h1>
            <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Business Automation, Done Properly.</p>
          </div>

          <div style="background-color: #f1f5f9; height: 1px; margin-bottom: 24px;"></div>

          <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
            Hello ${firstName},
          </h2>
          
          <p style="font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 16px;">
            Thank you for reaching out to us. We have received your inquiry regarding business automation${lead.business ? ` for <strong>${lead.business}</strong>` : ""}.
          </p>

          <div style="background-color: #f0f7ff; border-left: 3px solid #087bff; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 20px;">
              <strong>What happens next:</strong> Our automation team is reviewing your requirements and will get in touch with you via WhatsApp or Email within 24 business hours.
            </p>
          </div>

          <p style="font-size: 13px; line-height: 20px; color: #475569; margin-bottom: 24px;">
            If your requirement is urgent or you want to share additional details, feel free to chat with us directly on WhatsApp:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${waContactLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
              Chat on WhatsApp Directly →
            </a>
          </div>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
            © ${new Date().getFullYear()} LazyFlow • ${siteConfig.domain}<br>
            Business Automation Solutions
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Hello ${firstName},

Thank you for reaching out to LazyFlow! We have received your inquiry regarding business automation${lead.business ? ` for ${lead.business}` : ""}.

What happens next:
Our automation team is reviewing your requirements and will connect with you via WhatsApp or Email within 24 business hours.

Need an immediate response? You can also message us directly on WhatsApp:
${waContactLink}

Best regards,
The LazyFlow Team
https://${siteConfig.domain}
`;

  return sendEmail({
    to: lead.email,
    subject: `LazyFlow: Thank you for contacting us, ${firstName}`,
    htmlContent,
    textContent,
    fromName: "LazyFlow",
  });
}
