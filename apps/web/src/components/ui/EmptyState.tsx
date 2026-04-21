import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3.5rem 1.5rem",
      textAlign: "center",
      gap: "0.75rem",
    }}>
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: "var(--radius-lg)",
          background: "var(--surface-alt)", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "var(--text-muted)",
        }}>{icon}</div>
      )}
      <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>{title}</div>
      {description && <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: 380 }}>{description}</div>}
      {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
    </div>
  );
}
