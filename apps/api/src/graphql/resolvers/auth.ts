import { eq, and, gt } from "drizzle-orm";
import { otpCode, usuario } from "@perunor/db";
import { generateOtp, sendOtpEmail } from "../../lib/otp";
import { signToken } from "../../lib/jwt";
import type { ApolloContext } from "../../context";

export const authResolvers = {
  Mutation: {
    requestOtp: async (_: unknown, { email }: { email: string }, { db }: ApolloContext) => {
      const user = await db.query.usuario.findFirst({
        where: eq(usuario.email, email.toLowerCase()),
      });

      if (!user) return { ok: false, message: "Email no registrado en el sistema." };

      const code = generateOtp();
      const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

      await db.insert(otpCode).values({ email: email.toLowerCase(), code, expiraEn });

      if (process.env.NODE_ENV !== "production") {
        console.log(`\n[DEV] OTP para ${email}: ${code}\n`);
      } else {
        await sendOtpEmail(email, code);
      }

      return { ok: true, message: "Código enviado. Revisá tu correo." };
    },

    verifyOtp: async (_: unknown, { email, code }: { email: string; code: string }, { db }: ApolloContext) => {
      const otp = await db.query.otpCode.findFirst({
        where: and(
          eq(otpCode.email, email.toLowerCase()),
          eq(otpCode.code, code),
          eq(otpCode.usado, "0"),
          gt(otpCode.expiraEn, new Date()),
        ),
      });

      if (!otp) return { ok: false, message: "Código inválido o expirado." };

      await db.update(otpCode).set({ usado: "1" }).where(eq(otpCode.id, otp.id));

      const user = await db.query.usuario.findFirst({
        where: eq(usuario.email, email.toLowerCase()),
      });

      if (!user) return { ok: false, message: "Usuario no encontrado." };

      const token = await signToken({ sub: user.id, rol: user.rol });

      return { ok: true, token, usuario: { ...user, activo: user.activo === "1" } };
    },
  },
};
