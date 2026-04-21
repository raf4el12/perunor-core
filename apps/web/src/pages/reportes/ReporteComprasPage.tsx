import { useMemo, useState } from "react";
import { useLazyQuery, useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { toCsv, descargarCsv } from "../../lib/csv";

const PROVEEDORES_QUERY = gql`
  query ProveedoresReporte {
    proveedores(page: 1, limit: 500) { items { id ruc nombre } }
  }
`;

const REPORTE_QUERY = gql`
  query ReporteCompras($desde: String!, $hasta: String!, $proveedorId: ID) {
    reporteCompras(desde: $desde, hasta: $hasta, proveedorId: $proveedorId) {
      desde
      hasta
      totales { documentos subtotal igv total }
      detalle {
        documentoId numero fecha estado
        proveedorId proveedorNombre proveedorRuc
        lineas subtotal igv total
      }
      porProveedor {
        proveedorId proveedorNombre proveedorRuc
        documentos subtotal igv total
      }
    }
  }
`;

type Vista = "detalle" | "proveedor";

const hoy = () => new Date().toISOString().slice(0, 10);
const primerDiaMes = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  btnToggle: (active: boolean): React.CSSProperties => ({
    background: active ? "#1a3a5c" : "#e8edf2",
    color: active ? "#fff" : "#1a3a5c",
    border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
  }),
  filters: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" as const, alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.25rem", minWidth: 160 },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem" } as React.CSSProperties,
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", minWidth: 240 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.85rem" },
  th: { textAlign: "left" as const, padding: "0.55rem 0.5rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  thRight: { textAlign: "right" as const, padding: "0.55rem 0.5rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  td: { padding: "0.45rem 0.5rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  tdRight: { padding: "0.45rem 0.5rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const },
  kpis: { display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" as const },
  kpi: { background: "#fff", border: "1px solid #edf0f4", borderRadius: 10, padding: "0.75rem 1rem", minWidth: 160 } as React.CSSProperties,
  kpiLabel: { fontSize: "0.75rem", color: "#7a95aa", fontWeight: 600, textTransform: "uppercase" as const },
  kpiValue: { fontSize: "1.2rem", color: "#1a3a5c", fontWeight: 700, marginTop: "0.15rem" } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  toolbar: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
};

export function ReporteComprasPage() {
  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoy);
  const [proveedorId, setProveedorId] = useState("");
  const [vista, setVista] = useState<Vista>("detalle");

  const { data: provs } = useQuery(PROVEEDORES_QUERY);
  const proveedores = provs?.proveedores?.items ?? [];

  const [ejecutar, { data, loading, error }] = useLazyQuery(REPORTE_QUERY, { fetchPolicy: "network-only" });

  function consultar() {
    ejecutar({ variables: { desde, hasta, proveedorId: proveedorId || undefined } });
  }

  const reporte = data?.reporteCompras;
  const detalle = reporte?.detalle ?? [];
  const porProveedor = reporte?.porProveedor ?? [];
  const totales = reporte?.totales;

  const exportar = useMemo(() => () => {
    if (!reporte) return;
    if (vista === "detalle") {
      const csv = toCsv(
        detalle.map((d: any) => ({ ...d, fecha: d.fecha })),
        [
          { key: "fecha", label: "Fecha" },
          { key: "numero", label: "Número" },
          { key: "proveedorRuc", label: "RUC" },
          { key: "proveedorNombre", label: "Proveedor" },
          { key: "lineas", label: "Líneas" },
          { key: "subtotal", label: "Subtotal" },
          { key: "igv", label: "IGV" },
          { key: "total", label: "Total" },
        ],
      );
      descargarCsv(csv, `compras-detalle-${desde}-a-${hasta}`);
    } else {
      const csv = toCsv(porProveedor, [
        { key: "proveedorRuc", label: "RUC" },
        { key: "proveedorNombre", label: "Proveedor" },
        { key: "documentos", label: "Documentos" },
        { key: "subtotal", label: "Subtotal" },
        { key: "igv", label: "IGV" },
        { key: "total", label: "Total" },
      ]);
      descargarCsv(csv, `compras-por-proveedor-${desde}-a-${hasta}`);
    }
  }, [reporte, vista, detalle, porProveedor, desde, hasta]);

  return (
    <div style={s.page}>
      <Link to="/" style={s.backLink}>← Inicio</Link>

      <div style={s.header}>
        <h1 style={s.title}>Reporte de Compras</h1>
      </div>

      <div style={s.filters}>
        <div style={s.field}>
          <label style={s.label}>Desde</label>
          <input type="date" style={s.input} value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Hasta</label>
          <input type="date" style={s.input} value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Proveedor</label>
          <select style={s.select} value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
            <option value="">Todos</option>
            {proveedores.map((p: any) => <option key={p.id} value={p.id}>{p.ruc} — {p.nombre}</option>)}
          </select>
        </div>
        <button style={s.btnPrimary} onClick={consultar} disabled={loading}>
          {loading ? "Consultando..." : "Generar"}
        </button>
      </div>

      {error && <div style={s.errorBox}>{error.message}</div>}

      {reporte && (
        <>
          <div style={s.kpis}>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Documentos</div>
              <div style={s.kpiValue}>{totales.documentos}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Subtotal</div>
              <div style={s.kpiValue}>{Number(totales.subtotal).toFixed(2)}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>IGV</div>
              <div style={s.kpiValue}>{Number(totales.igv).toFixed(2)}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Total</div>
              <div style={s.kpiValue}>{Number(totales.total).toFixed(2)}</div>
            </div>
          </div>

          <div style={s.toolbar}>
            <button style={s.btnToggle(vista === "detalle")} onClick={() => setVista("detalle")}>Detalle</button>
            <button style={s.btnToggle(vista === "proveedor")} onClick={() => setVista("proveedor")}>Por proveedor</button>
            <div style={{ flex: 1 }} />
            <button style={s.btnSecondary} onClick={exportar} disabled={detalle.length === 0}>Exportar CSV</button>
          </div>

          {vista === "detalle" ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Número</th>
                  <th style={s.th}>RUC</th>
                  <th style={s.th}>Proveedor</th>
                  <th style={s.thRight}>Líneas</th>
                  <th style={s.thRight}>Subtotal</th>
                  <th style={s.thRight}>IGV</th>
                  <th style={s.thRight}>Total</th>
                </tr>
              </thead>
              <tbody>
                {detalle.length === 0 ? (
                  <tr><td colSpan={8} style={s.emptyRow}>Sin compras en el período.</td></tr>
                ) : (
                  detalle.map((d: any) => (
                    <tr key={d.documentoId}>
                      <td style={s.td}>{d.fecha}</td>
                      <td style={s.td}><strong>{d.numero ?? "—"}</strong></td>
                      <td style={s.td}>{d.proveedorRuc ?? "—"}</td>
                      <td style={s.td}>{d.proveedorNombre ?? "—"}</td>
                      <td style={s.tdRight}>{d.lineas}</td>
                      <td style={s.tdRight}>{Number(d.subtotal).toFixed(2)}</td>
                      <td style={s.tdRight}>{Number(d.igv).toFixed(2)}</td>
                      <td style={s.tdRight}>{Number(d.total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>RUC</th>
                  <th style={s.th}>Proveedor</th>
                  <th style={s.thRight}>Documentos</th>
                  <th style={s.thRight}>Subtotal</th>
                  <th style={s.thRight}>IGV</th>
                  <th style={s.thRight}>Total</th>
                </tr>
              </thead>
              <tbody>
                {porProveedor.length === 0 ? (
                  <tr><td colSpan={6} style={s.emptyRow}>Sin compras en el período.</td></tr>
                ) : (
                  porProveedor.map((p: any, i: number) => (
                    <tr key={p.proveedorId ?? `sin-${i}`}>
                      <td style={s.td}>{p.proveedorRuc ?? "—"}</td>
                      <td style={s.td}>{p.proveedorNombre ?? "—"}</td>
                      <td style={s.tdRight}>{p.documentos}</td>
                      <td style={s.tdRight}>{Number(p.subtotal).toFixed(2)}</td>
                      <td style={s.tdRight}>{Number(p.igv).toFixed(2)}</td>
                      <td style={s.tdRight}><strong>{Number(p.total).toFixed(2)}</strong></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      {!reporte && !loading && !error && (
        <div style={{ color: "#7a95aa", padding: "2rem 0" }}>
          Selecciona un período y presiona "Generar".
        </div>
      )}
    </div>
  );
}
