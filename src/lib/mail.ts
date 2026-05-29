import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

export async function sendMail({ to, subject, html, text, replyTo }: SendMailInput) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return { sent: false as const, reason: "smtp_not_configured" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "Shifaa Parapharmacie <noreply@shifaa.dz>",
    to,
    replyTo,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, " "),
  });

  return { sent: true as const };
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const subject = "Réinitialisation de votre mot de passe — Shifaa";
  const html = `
    <p>Bonjour,</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>Shifaa Parapharmacie</strong>.</p>
    <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a></p>
    <p>Ce lien expire dans 1 heure.</p>
  `;
  return sendMail({ to, subject, html });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const to = process.env.CONTACT_INBOX ?? process.env.MAIL_FROM ?? "contact@shifaa.dz";
  const html = `
    <p><strong>${data.name}</strong> &lt;${data.email}&gt;</p>
    <p>Objet : ${data.subject}</p>
    <hr />
    <p>${data.message.replace(/\n/g, "<br>")}</p>
  `;
  return sendMail({
    to,
    replyTo: data.email,
    subject: `[Contact Shifaa] ${data.subject}`,
    html,
  });
}
