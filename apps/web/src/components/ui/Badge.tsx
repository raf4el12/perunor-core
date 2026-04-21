import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "ingreso" | "egreso" | "borrador" | "confirmado" | "anulado";

const tones: Record<Tone, { bg: string; color: string; dot?: string }> = {
  neutral: { bg: "var(--stone-150)", color: "var(--stone-700)", dot: "var(--stone-500)" },
  brand: { bg: "var(--brand-50)", color: "var(--brand-700)", dot: "var(--brand-500)" },
  accent: { bg: "var(--accent-subtle)", color: "var(--paprika-700)", dot: "var(--accent)" },
  success: { bg: "var(--success-subtle)", color: "var(--sage-700)", dot: "var(--success)" },
  warning: { bg: "var(--warning-subtle)", color: "var(--ochre-600)", dot: "var(--warning)" },
  danger: { bg: "var(--danger-subtle)", color: "var(--paprika-700)", dot: "var(--danger)" },
  ingreso: { bg: "var(--success-subtle)", color: "var(--sage-700)", dot: "var(--success)" },
  egreso: { bg: "var(--danger-subtle)", color: "var(--paprika-700)", dot: "var(--danger)" },
  borrador: { bg: "var(--stone-150)", color: "var(--stone-700)", dot: "var(--stone-500)" },
  confirmado: { bg: "var(--success-subtle)", color: "var(--sage-700)", dot: "var(--success)" },
  anulado: { bg: "var(--danger-subtle)", color: "var(--paprika-700)", dot: "var(--danger)" },
};

export function Badge({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.15rem 0.55rem",
        background: t.bg,
        color: t.color,
        borderRadius: "var(--radius-full)",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "capitalize",
        lineHeight: 1.5,
      }}
    >
      {dot && t.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: t.dot,
            display: "inline-block",
          }}
        />
      )}
      {children}
    </span>
  );
}
