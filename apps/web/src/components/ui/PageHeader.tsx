import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ eyebrow, title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "1.5rem",
        marginBottom: "1.75rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                {b.href ? (
                  <a href={b.href} style={{ color: "var(--text-muted)", fontWeight: 500 }}>{b.label}</a>
                ) : (
                  <span>{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <span style={{ color: "var(--text-subtle)" }}>/</span>}
              </span>
            ))}
          </div>
        )}
        {eyebrow && (
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.35rem" }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontSize: "2rem", lineHeight: 1.1, marginBottom: subtitle ? "0.45rem" : 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", margin: 0, maxWidth: 640 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "0.55rem", alignItems: "center", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}
