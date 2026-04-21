import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  tone?: "default" | "sunken" | "brand" | "accent";
}

const padMap = { none: 0, sm: "1rem", md: "1.5rem", lg: "2rem" };

export function Card({ padding = "md", tone = "default", style, children, ...rest }: CardProps) {
  const tones: Record<NonNullable<CardProps["tone"]>, React.CSSProperties> = {
    default: { background: "var(--surface)", border: "1px solid var(--border)" },
    sunken: { background: "var(--surface-sunken)", border: "1px solid var(--border)" },
    brand: { background: "var(--brand-700)", color: "var(--text-inverse)", border: "1px solid var(--brand-800)" },
    accent: { background: "var(--accent-subtle)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" },
  };
  return (
    <div
      {...rest}
      style={{
        borderRadius: "var(--radius-lg)",
        padding: padMap[padding],
        boxShadow: "var(--shadow-xs)",
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
      <div>
        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}
