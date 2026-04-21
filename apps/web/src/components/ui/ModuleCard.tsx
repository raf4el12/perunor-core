import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type Color = "primary" | "amber" | "blue" | "red" | "emerald" | "slate";

interface ModuleCardProps {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  badge?: number;
  color?: Color;
}

const colors: Record<Color, { bg: string; bgHover: string; iconBg: string; iconColor: string }> = {
  primary: { bg: "var(--brand-50)", bgHover: "var(--brand-100)", iconBg: "var(--brand-500)", iconColor: "#fff" },
  amber:   { bg: "var(--ochre-50)", bgHover: "var(--ochre-100)", iconBg: "var(--ochre-500)", iconColor: "#fff" },
  blue:    { bg: "#eff6ff", bgHover: "#dbeafe", iconBg: "#3b82f6", iconColor: "#fff" },
  red:     { bg: "var(--paprika-50)", bgHover: "var(--paprika-100)", iconBg: "var(--paprika-500)", iconColor: "#fff" },
  emerald: { bg: "var(--sage-50)", bgHover: "var(--sage-100)", iconBg: "var(--sage-500)", iconColor: "#fff" },
  slate:   { bg: "var(--stone-100)", bgHover: "var(--stone-150)", iconBg: "var(--stone-600)", iconColor: "#fff" },
};

export function ModuleCard({ title, description, to, icon, badge, color = "slate" }: ModuleCardProps) {
  const c = colors[color];
  return (
    <Link
      to={to}
      style={{
        display: "block",
        background: c.bg,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1.1rem",
        transition: "background var(--dur), transform var(--dur), box-shadow var(--dur)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = c.bgHover;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = c.bg;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: "var(--radius-md)",
            background: c.iconBg, color: c.iconColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "0.98rem", margin: 0, fontWeight: 700, fontFamily: "var(--font-body)", color: "var(--text)", letterSpacing: "-0.01em" }}>
              {title}
            </h3>
            {badge !== undefined && badge > 0 && (
              <span style={{
                minWidth: 20, height: 20, padding: "0 6px",
                background: c.iconBg, color: c.iconColor,
                borderRadius: "var(--radius-full)",
                fontSize: "0.7rem", fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {badge}
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.25rem 0 0", lineHeight: 1.4 }}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
