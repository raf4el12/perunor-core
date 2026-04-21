import { useMemo, useState } from "react";
import { useLazyQuery, useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { toCsv, descargarCsv } from "../../lib/csv";

const FILTROS_QUERY = gql`
  query FiltrosMovimientos {
    almacenes(page: 1, limit: 200) { items { id nombre } }
    articulos(page: 1, limit: 500) { items { id codigo nombre } }
  }
`;

const REPORTE_QUERY = gql`
  query ReporteMovimientos($desde: String!, $hasta: String!, $almacenId: ID, $articuloId: ID) {
    reporteMovimientos(desde: $desde, hasta: $hasta, almacenId: $almacenId, articuloId: $articuloId) {
      desde
      hasta
      totalIngresos
      totalEgresos
      valorIngresos
      valorEgresos
      items {
        id fecha
        articuloId articuloCodigo articuloNombre unidad
        almacenId almacenNombre
        movimiento cantidad costoUnitario costoTotal saldoCantidad
        referencia
      }
    }
  }
`;

const hoy = () => new Date().toISOString().slice(0, 10);
const primerDiaMes = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1300, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  filters: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" as const, alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.25rem", minWidth: 160 },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem" } as React.CSSProperties,
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", minWidth: 220 } as React.CSSProperties,
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
  toolbar: { display: "flex", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "center" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
  badge: (tipo: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "0.15rem 0.5rem",
    borderRadius: 4,
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    background: tipo === "ingreso" ? "#d7f0dd" : "#fde3e0",
    color: tipo === "ingreso" ? "#256b36" : "#992f23",
  }),
};

function formatoFecha(iso: string) {
  const d = new Date(iso);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}`;
}

export function ReporteMovimientosPage() {
  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(hoy);
  const [almacenId, setAlmacenId] = useState("");
  const [articuloId, setArticuloId] = useState("");

  const { data: filtros } = useQuery(FILTROS_QUERY);
  const almacenes = filtros?.almacenes?.items ?? [];
  const articulos = filtros?.articulos?.items ?? [];

  const [ejecutar, { data, loading, error }] = useLazyQuery(REPORTE_QUERY, { fetchPolicy: "network-only" });

  function consultar() {
    ejecutar({
      variables: {
        desde,
        hasta,
        almacenId: almacenId || undefined,
        articuloId: articuloId || undefined,
      },
    });
  }

  const reporte = data?.reporteMovimientos;
  const items = reporte?.items ?? [];

  const exportar = useMemo(() => () => {
    if (!reporte) return;
    const filas = items.map((i: any) => ({
      fecha: formatoFecha(i.fecha),
      articuloCodigo: i.articuloCodigo,
      articuloNombre: i.articuloNombre,
      almacenNombre: i.almacenNombre,
      movimiento: i.movimiento,
      cantidad: i.cantidad,
      unidad: i.unidad,
      costoUnitario: i.costoUnitario,
      costoTotal: i.costoTotal,
      saldoCantidad: i.saldoCantidad,
      referencia: i.referencia ?? "",
    }));
    const csv = toCsv(filas, [
      { key: "fecha", label: "Fecha" },
      { key: "articuloCodigo", label: "Código" },
      { key: "articuloNombre", label: "Artículo" },
      { key: "almacenNombre", label: "Almacén" },
      { key: "movimiento", label: "Movimiento" },
      { key: "cantidad", label: "Cantidad" },
      { key: "unidad", label: "Unidad" },
      { key: "costoUnitario", label: "Costo unit." },
      { key: "costoTotal", label: "Costo total" },
      { key: "saldoCantidad", label: "Saldo" },
      { key: "referencia", label: "Referencia" },
    ]);
    descargarCsv(csv, `movimientos-${desde}-a-${hasta}`);
  }, [reporte, items, desde, hasta]);

  return (
    <div style={s.page}>
      <Link to="/" style={s.backLink}>← Inicio</Link>

      <div style={s.header}>
        <h1 style={s.title}>Reporte de Movimientos</h1>
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
          <label style={s.label}>Almacén</label>
          <select style={s.select} value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
            <option value="">Todos</option>
            {almacenes.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Artículo</label>
          <select style={s.select} value={articuloId} onChange={(e) => setArticuloId(e.target.value)}>
            <option value="">Todos</option>
            {articulos.map((a: any) => <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>)}
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
              <div style={s.kpiLabel}>Movimientos</div>
              <div style={s.kpiValue}>{items.length}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Cant. ingresada</div>
              <div style={s.kpiValue}>{Number(reporte.totalIngresos).toFixed(2)}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Cant. egresada</div>
              <div style={s.kpiValue}>{Number(reporte.totalEgresos).toFixed(2)}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Valor ingresos</div>
              <div style={s.kpiValue}>{Number(reporte.valorIngresos).toFixed(2)}</div>
            </div>
            <div style={s.kpi}>
              <div style={s.kpiLabel}>Valor egresos</div>
              <div style={s.kpiValue}>{Number(reporte.valorEgresos).toFixed(2)}</div>
            </div>
          </div>

          <div style={s.toolbar}>
            <div style={{ flex: 1 }} />
            <button style={s.btnSecondary} onClick={exportar} disabled={items.length === 0}>Exportar CSV</button>
          </div>

          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Artículo</th>
                <th style={s.th}>Almacén</th>
                <th style={s.th}>Mov.</th>
                <th style={s.thRight}>Cantidad</th>
                <th style={s.th}>Unid.</th>
                <th style={s.thRight}>Costo unit.</th>
                <th style={s.thRight}>Costo total</th>
                <th style={s.thRight}>Saldo</th>
                <th style={s.th}>Referencia</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={10} style={s.emptyRow}>Sin movimientos en el período.</td></tr>
              ) : (
                items.map((i: any) => (
                  <tr key={i.id}>
                    <td style={s.td}>{formatoFecha(i.fecha)}</td>
                    <td style={s.td}>
                      <strong>{i.articuloCodigo}</strong> — {i.articuloNombre}
                    </td>
                    <td style={s.td}>{i.almacenNombre}</td>
                    <td style={s.td}><span style={s.badge(i.movimiento)}>{i.movimiento}</span></td>
                    <td style={s.tdRight}>{Number(i.cantidad).toFixed(4)}</td>
                    <td style={s.td}>{i.unidad}</td>
                    <td style={s.tdRight}>{Number(i.costoUnitario).toFixed(4)}</td>
                    <td style={s.tdRight}>{Number(i.costoTotal).toFixed(2)}</td>
                    <td style={{ ...s.tdRight, color: Number(i.saldoCantidad) < 0 ? "#c0392b" : undefined }}>
                      {Number(i.saldoCantidad).toFixed(4)}
                    </td>
                    <td style={s.td}>{i.referencia ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
