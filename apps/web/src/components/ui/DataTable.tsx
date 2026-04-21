import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  align?: "left" | "right" | "center";
  width?: string | number;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
  empty?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  compact?: boolean;
}

export function DataTable<T>({ columns, rows, keyExtractor, empty, loading, onRowClick, compact }: DataTableProps<T>) {
  const pad = compact ? "0.45rem 0.7rem" : "0.7rem 0.9rem";
  return (
    <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--surface)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-alt)" }}>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: c.align ?? "left",
                    padding: pad,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid var(--border)",
                    width: c.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ padding: pad, borderBottom: "1px solid var(--border)" }}>
                      <div style={{ height: 12, borderRadius: 4, background: "linear-gradient(90deg, var(--stone-150) 0%, var(--stone-200) 50%, var(--stone-150) 100%)", backgroundSize: "400px 100%", animation: "shimmer 1.4s linear infinite" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                  {empty ?? "Sin resultados."}
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={keyExtractor(r, i)}
                  style={{ borderBottom: "1px solid var(--border)", cursor: onRowClick ? "pointer" : "default", transition: "background var(--dur)" }}
                  onClick={() => onRowClick?.(r)}
                  onMouseEnter={(e) => {
                    if (onRowClick) e.currentTarget.style.background = "var(--surface-alt)";
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {columns.map((c) => (
                    <td key={c.key} style={{ padding: pad, textAlign: c.align ?? "left", color: "var(--text)", verticalAlign: "middle" }}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
