import { useState } from "react";
import { gql, useMutation, useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const REQUEST_OTP = gql`
  mutation RequestOtp($email: String!) {
    requestOtp(email: $email) { ok message }
  }
`;

const VERIFY_OTP = gql`
  mutation VerifyOtp($email: String!, $code: String!) {
    verifyOtp(email: $email, code: $code) { ok token message usuario { id nombre rol } }
  }
`;

const colors = {
  brand: "#1a3a5c",
  brandDark: "#0f2740",
  brandLight: "#2c5282",
  accent: "#d97706",
  paprika: "#b91c1c",
  bg: "#f8fafc",
  surface: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  error: "#dc2626",
  errorBg: "#fef2f2",
  success: "#15803d",
};

const s = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    background: colors.bg,
  } as React.CSSProperties,
  hero: {
    position: "relative" as const,
    background: `linear-gradient(135deg, ${colors.brandDark} 0%, ${colors.brand} 55%, ${colors.brandLight} 100%)`,
    color: "#fff",
    padding: "3rem",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 20% 15%, rgba(217, 119, 6, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(185, 28, 28, 0.25) 0%, transparent 50%)",
    pointerEvents: "none" as const,
  },
  heroContent: { position: "relative" as const, zIndex: 1 },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.65rem",
    fontWeight: 700,
    fontSize: "1.05rem",
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.paprika} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "0.95rem",
    boxShadow: "0 4px 14px rgba(217, 119, 6, 0.45)",
  } as React.CSSProperties,
  heroTitle: {
    fontSize: "2.75rem",
    lineHeight: 1.1,
    marginTop: "4rem",
    marginBottom: "1rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: "1.05rem",
    lineHeight: 1.6,
    opacity: 0.85,
    maxWidth: 440,
    marginBottom: "2.5rem",
  } as React.CSSProperties,
  heroBullets: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.9rem",
    opacity: 0.95,
  },
  bulletRow: { display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.95rem" },
  bulletIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
  } as React.CSSProperties,
  heroFoot: {
    position: "relative" as const,
    zIndex: 1,
    fontSize: "0.8rem",
    opacity: 0.6,
  },
  formSide: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2rem",
  } as React.CSSProperties,
  formCard: {
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  } as React.CSSProperties,
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: colors.text,
    marginBottom: "0.25rem",
    letterSpacing: "-0.01em",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "0.92rem",
    color: colors.textMuted,
    marginBottom: "1.5rem",
    lineHeight: 1.5,
  } as React.CSSProperties,
  field: { display: "flex", flexDirection: "column" as const, gap: "0.35rem" },
  label: { fontSize: "0.8rem", fontWeight: 600, color: colors.text },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: "0 0.85rem",
    background: colors.surface,
    transition: "border-color 0.15s, box-shadow 0.15s",
  } as React.CSSProperties,
  inputIcon: { color: colors.textMuted, marginRight: "0.6rem", display: "flex" },
  input: {
    flex: 1,
    padding: "0.85rem 0",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    background: "transparent",
    color: colors.text,
  } as React.CSSProperties,
  inputOtp: {
    textAlign: "center" as const,
    letterSpacing: "0.5em",
    fontSize: "1.4rem",
    fontWeight: 600,
    paddingLeft: "0.5em",
  } as React.CSSProperties,
  button: {
    padding: "0.85rem 1rem",
    background: colors.brand,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "background 0.15s, transform 0.05s",
    marginTop: "0.25rem",
  } as React.CSSProperties,
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" } as React.CSSProperties,
  linkBtn: {
    background: "transparent",
    border: "none",
    color: colors.textMuted,
    cursor: "pointer",
    fontSize: "0.85rem",
    padding: "0.4rem 0",
    alignSelf: "center",
  } as React.CSSProperties,
  alertError: {
    background: colors.errorBg,
    color: colors.error,
    padding: "0.65rem 0.85rem",
    borderRadius: 8,
    fontSize: "0.85rem",
    border: `1px solid ${colors.error}33`,
  } as React.CSSProperties,
  hint: {
    fontSize: "0.78rem",
    color: colors.textMuted,
    marginTop: "-0.2rem",
  } as React.CSSProperties,
};

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="M10.5 12.5 21 2" />
    <path d="m15.5 7.5 3 3" />
  </svg>
);

export function LoginPage() {
  const navigate = useNavigate();
  const apollo = useApolloClient();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");

  const [requestOtp, { loading: loadingOtp }] = useMutation(REQUEST_OTP);
  const [verifyOtp, { loading: loadingVerify }] = useMutation(VERIFY_OTP);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { data } = await requestOtp({ variables: { email } });
    if (data.requestOtp.ok) setStep("otp");
    else setError(data.requestOtp.message);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { data } = await verifyOtp({ variables: { email, code } });
    if (data.verifyOtp.ok) {
      localStorage.setItem("token", data.verifyOtp.token);
      await apollo.resetStore();
      navigate("/", { replace: true });
    } else {
      setError(data.verifyOtp.message);
    }
  }

  return (
    <div style={s.page}>
      <aside style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.logo}>
            <span style={s.logoDot}>P</span>
            <span>PERUNOR</span>
          </div>
          <h1 style={s.heroTitle}>
            Gestión integral<br />de agroindustria.
          </h1>
          <p style={s.heroSubtitle}>
            Compras, procesamiento, inventario y reportes de paprika en una sola plataforma.
          </p>
          <div style={s.heroBullets}>
            <div style={s.bulletRow}>
              <span style={s.bulletIcon}>✓</span>
              Kardex en tiempo real con valuación promedio ponderado
            </div>
            <div style={s.bulletRow}>
              <span style={s.bulletIcon}>✓</span>
              Documentos polimórficos y máquina de estados auditada
            </div>
            <div style={s.bulletRow}>
              <span style={s.bulletIcon}>✓</span>
              Reportes exportables a CSV, listos para Excel
            </div>
          </div>
        </div>
        <div style={s.heroFoot}>© {new Date().getFullYear()} Perunor · ERP Agroindustrial</div>
      </aside>

      <main style={s.formSide}>
        <div style={s.formCard}>
          <div>
            <h2 style={s.title}>
              {step === "email" ? "Bienvenido de vuelta" : "Revisa tu código"}
            </h2>
            <p style={s.subtitle}>
              {step === "email"
                ? "Ingresa tu correo. Te enviaremos un código de acceso de un solo uso."
                : <>Enviamos un código a <strong style={{ color: colors.text }}>{email}</strong>.</>}
            </p>
          </div>

          {error && <div style={s.alertError}>{error}</div>}

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={s.field}>
                <label style={s.label}>Correo electrónico</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><MailIcon /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com"
                    required
                    autoFocus
                    autoComplete="email"
                    style={s.input}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loadingOtp}
                style={{ ...s.button, ...(loadingOtp ? s.buttonDisabled : {}) }}
              >
                {loadingOtp ? "Enviando..." : "Enviar código"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={s.field}>
                <label style={s.label}>Código de 6 dígitos</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}><KeyIcon /></span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    required
                    autoFocus
                    style={{ ...s.input, ...s.inputOtp }}
                  />
                </div>
                <div style={s.hint}>El código expira en 5 minutos.</div>
              </div>
              <button
                type="submit"
                disabled={loadingVerify}
                style={{ ...s.button, ...(loadingVerify ? s.buttonDisabled : {}) }}
              >
                {loadingVerify ? "Verificando..." : "Ingresar"}
              </button>
              <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} style={s.linkBtn}>
                ← Cambiar correo
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
