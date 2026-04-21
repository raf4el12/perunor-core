import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: Variant;
  trend?: { value: number; isPositive: boolean };
}

const variantStyles: Record<Variant, { bg: string; iconBg: string; iconColor: string; accent: string }> = {
  default: { bg: "var(--surface)", iconBg: "var(--surface-alt)", iconColor: "var(--text-muted)", accent: "var(--text)" },
  success: { bg: "var(--sage-50)", iconBg: "var(--sage-100)", iconColor: "var(--sage-700)", accent: "var(--sage-700)" },
  warning: { bg: "var(--ochre-50)", iconBg: "var(--ochre-100)", iconColor: "var(--ochre-600)", accent: "var(--ochre-600)" },
  danger: { bg: "var(--paprika-50)", iconBg: "var(--paprika-100)", iconColor: "var(--paprika-700)", accent: "var(--paprika-700)" },
  info: { bg: "var(--brand-50)", iconBg: "var(--brand-100)", iconColor: "var(--brand-700)", accent: "var(--brand-700)" },
};

export function KpiCard({ title, value, subtitle, icon, variant = "default", trend }: KpiCardProps) {
  const s = variantStyles[variant];
  return (
    <div
      style={{
        background: s.bg,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.1rem",
        boxShadow: "var(--shadow-xs)",
        transition: "transform var(--dur) var(--ease-smooth), box-shadow var(--dur)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "0.7rem", fontWeight: 700,
              color: s.accent, opacity: 0.85,
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: "0.45rem",
            }}
          >
            {title}
          </div>
          <div
            className="num"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem", fontWeight: 700,
              color: "var(--text)", lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: "0.35rem", color: trend.isPositive ? "var(--sage-700)" : "var(--paprika-700)" }}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div
          style={{
            width: 44, height: 44, borderRadius: "var(--radius-md)",
            background: s.iconBg,
            color: s.iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
