import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
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

export function LoginPage() {
  const navigate = useNavigate();
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
      navigate("/");
    } else {
      setError(data.verifyOtp.message);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f1f5f9" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "360px", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        <h1 style={{ color: "#1a3a5c", marginBottom: "0.25rem" }}>Perunor ERP</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "14px" }}>
          {step === "email" ? "Ingresá tu email para continuar." : `Código enviado a ${email}.`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleRequestOtp}>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", marginBottom: "1rem", boxSizing: "border-box" }}
            />
            <button type="submit" disabled={loadingOtp}
              style={{ width: "100%", padding: "10px", background: "#1a3a5c", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              {loadingOtp ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="000000" maxLength={6} required
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e0", marginBottom: "1rem", fontSize: "24px", textAlign: "center", letterSpacing: "8px", boxSizing: "border-box" }}
            />
            <button type="submit" disabled={loadingVerify}
              style={{ width: "100%", padding: "10px", background: "#276749", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
              {loadingVerify ? "Verificando..." : "Ingresar"}
            </button>
            <button type="button" onClick={() => setStep("email")}
              style={{ width: "100%", padding: "8px", marginTop: "8px", background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: "14px" }}>
              Cambiar email
            </button>
          </form>
        )}

        {error && <p style={{ color: "#e53e3e", marginTop: "1rem", fontSize: "14px" }}>{error}</p>}
      </div>
    </div>
  );
}
