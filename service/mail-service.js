import nodemailer from "nodemailer";

class MailService {
  constructor() {
    this.transporter = null;
  }

  async sendViaResend(email, subject, text, html) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_USER;

    console.log("[MailService] sendViaResend start", {
      email,
      fromEmail,
      hasApiKey: !!resendApiKey,
    });

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!fromEmail) {
      throw new Error("RESEND_FROM_EMAIL is not configured");
    }

    if (
      fromEmail.endsWith("@gmail.com") ||
      fromEmail.endsWith("@yahoo.com") ||
      fromEmail.endsWith("@hotmail.com")
    ) {
      throw new Error(
        "Resend не поддерживает отправку с публичного почтового домена. Используйте в RESEND_FROM_EMAIL верифицированный собственный домен",
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject,
        html,
        text,
      }),
    });

    const result = await response.json();
    console.log("[MailService] resend response", {
      status: response.status,
      ok: response.ok,
      result,
    });

    if (!response.ok) {
      const errorMessage =
        result?.error || result?.message || JSON.stringify(result);
      throw new Error(`Resend send failed ${response.status}: ${errorMessage}`);
    }

    return {
      message: "Код отправлен на почту через Resend",
      resend: result,
    };
  }

  getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      console.warn("[MailService] SMTP configuration incomplete", {
        host: !!process.env.SMTP_HOST,
        port: !!process.env.SMTP_PORT,
        user: !!process.env.SMTP_USER,
        password: !!process.env.SMTP_PASSWORD,
      });
      return null;
    }

    const port = Number(process.env.SMTP_PORT);
    const secure = port === 465;
    const useTLS = port === 587;

    console.log("[MailService] createTransporter", {
      host: process.env.SMTP_HOST,
      port,
      secure,
      requireTLS: useTLS,
      user: process.env.SMTP_USER,
      debug: process.env.SMTP_DEBUG === "true",
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      requireTLS: useTLS,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      logger: process.env.SMTP_DEBUG === "true",
      debug: process.env.SMTP_DEBUG === "true",
    });

    return this.transporter;
  }

  async sendCode(email, code) {
    const subject = "Код подтверждения";
    const text = `Ваш код подтверждения: ${code}`;
    const html = `<p>Ваш код подтверждения: <strong>${code}</strong></p>`;

    console.log("[MailService] sendCode start", { email, code });

    if (process.env.RESEND_API_KEY) {
      try {
        return await this.sendViaResend(email, subject, text, html);
      } catch (error) {
        console.error("[MailService] sendViaResend error", error);
        console.warn("Resend failed, falling back to SMTP/console");
      }
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn(
        "[MailService] SMTP credentials are not configured. Falling back to console output.",
      );
      console.log(`Fallback send-code: ${email} -> ${code}`);
      return { message: "Код сохранён в логах (SMTP не настроен)" };
    }

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text,
        html,
      });

      console.log("[MailService] sendMail success", {
        email,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });
      return { message: "Код отправлен на почту" };
    } catch (err) {
      console.error("[MailService] sendMail error", err);
      console.warn(
        "Mail send failed, fallback to console:",
        err?.message || err,
      );
      console.log(`Fallback send-code: ${email} -> ${code}`);
      return { message: "Код сохранён в логах (SMTP не удалось отправить)" };
    }
  }
}

export const mailService = new MailService();
