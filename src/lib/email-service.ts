import nodemailer from "nodemailer";

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log(
        `[EMAIL NOTICE] SMTP credentials (SMTP_HOST/SMTP_USER/SMTP_PASS) not configured in .env.local. Recipient: ${to}, Subject: ${subject}`
      );
      return { success: false, reason: "SMTP_NOT_CONFIGURED" };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"City Survey System" <${smtpUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL DISPATCH SUCCESS] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[EMAIL DISPATCH ERROR]:", error.message);
    return { success: false, error: error.message };
  }
}
