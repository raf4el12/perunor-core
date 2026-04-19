import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendOtpEmail(email: string, code: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@perunor.com",
    to: email,
    subject: "Tu código de acceso - Perunor ERP",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2>Código de acceso</h2>
        <p>Tu código para ingresar al sistema es:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a3a5c; padding: 16px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">Expira en 5 minutos. No compartas este código.</p>
      </div>
    `,
  });
}
