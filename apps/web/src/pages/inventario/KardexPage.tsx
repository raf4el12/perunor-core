import { useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";

const CATALOGOS_QUERY = gql`
  query CatalogosKardex {
    articulos(page: 1, limit: 500) { items { id codigo nombre unidadMedida } }
    almacenes(page: 1, limit: 100) { items { id nombre } }
  }
`;

const KARDEX_QUERY = gql`
  query Kardex($articuloId: ID!, $almacenId: ID!, $page: Int, $limit: Int) {
    kardex(articuloId: $articuloId, almacenId: $almacenId, page: $page, limit: $limit) {
      items {
        id
        fecha
        movimiento
        cantidad
        costoUnitario
        costoTotal
        saldoCantidad
        saldoCosto
        saldoCostoUnitario
        referencia
        documento { id tipo numero }
      }
      total
      page
      limit
    }
  }
`;

type Movimiento = "ingreso" | "egreso";

interface KardexRow {
  id: string;
  fecha: string;
  movimiento: Movimiento;
  cantidad: string;
  costoUnitario: string;
  costoTotal: string;
  saldoCantidad: string;
  saldoCosto: string;
  saldoCostoUnitario: string;
  referencia: string | null;
  documento: { id: string; tipo: string; numero: string | null } | null;
}

const LIMIT = 50;

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  filters: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" as const, alignItems: "flex-end" },
  field: { display: "flex", flexDirection: "column" as const, gap: "0.25rem", minWidth: 220 },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.85rem" },
  th: { textAlign: "left" as const, padding: "0.55rem 0.5rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  thRight: { textAlign: "right" as const, padding: "0.55rem 0.5rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  td: { padding: "0.45rem 0.5rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  tdRight: { padding: "0.45rem 0.5rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const },
  pill: (mov: Movimiento): React.CSSProperties => ({
    display: "inline-block", padding: "0.15rem 0.5rem", borderRadius: 12, fontSize: "0.7rem", fontWeight: 600,
    background: mov === "ingreso" ? "#e6f4ea" : "#fce8e8",
    color: mov === "ingreso" ? "#27ae60" : "#c0392b",
  }),
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#4a6580" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
};

export function KardexPage() {
  const [articuloId, setArticuloId] = useState("");
  const [almacenId, setAlmacenId] = useState("");
  const [page, setPage] = useState(1);

  const { data: catalogos } = useQuery(CATALOGOS_QUERY);

  const puedeConsultar = !!(articuloId && almacenId);

  const { data, loading } = useQuery(KARDEX_QUERY, {
    variables: { articuloId, almacenId, page, limit: LIMIT },
    skip: !puedeConsultar,
    fetchPolicy: "cache-and-network",
  });

  const articulos = catalogos?.articulos?.items ?? [];
  const almacenes = catalogos?.almacenes?.items ?? [];
  const rows: KardexRow[] = data?.kardex?.items ?? [];
  const total: number = data?.kardex?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const articuloSel = useMemo(
    () => articulos.find((a: any) => a.id === articuloId),
    [articulos, articuloId],
  );

  return (
    <div style={s.page}>
      <Link to="/" style={s.backLink}>← Inicio</Link>

      <div style={s.header}>
        <h1 style={s.title}>Kardex</h1>
      </div>

      <div style={s.filters}>
        <div style={s.field}>
          <label style={s.label}>Artículo</label>
          <select
            style={s.select}
            value={articuloId}
            onChange={(e) => { setArticuloId(e.target.value); setPage(1); }}
          >
            <option value="">— Seleccionar —</option>
            {articulos.map((a: any) => <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Almacén</label>
          <select
            style={s.select}
            value={almacenId}
            onChange={(e) => { setAlmacenId(e.target.value); setPage(1); }}
          >
            <option value="">— Seleccionar —</option>
            {almacenes.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
      </div>

      {!puedeConsultar && (
        <div style={{ color: "#7a95aa", padding: "2rem 0" }}>
          Selecciona un artículo y un almacén para ver su kardex.
        </div>
      )}

      {puedeConsultar && loading && <p style={{ color: "#7a95aa" }}>Cargando...</p>}

      {puedeConsultar && (
        <>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Mov.</th>
                <th style={s.th}>Doc.</th>
                <th style={s.thRight}>Cant.</th>
                <th style={s.thRight}>Costo unit.</th>
                <th style={s.thRight}>Costo total</th>
                <th style={s.thRight}>Saldo cant.</th>
                <th style={s.thRight}>Saldo costo</th>
                <th style={s.thRight}>Costo prom.</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr><td colSpan={9} style={s.emptyRow}>Sin movimientos para {articuloSel?.nombre ?? "este artículo"}.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td style={s.td}>{new Date(r.fecha).toLocaleDateString()}</td>
                    <td style={s.td}><span style={s.pill(r.movimiento)}>{r.movimiento}</span></td>
                    <td style={s.td}>{r.referencia ?? <span style={{ color: "#7a95aa" }}>—</span>}</td>
                    <td style={s.tdRight}>{Number(r.cantidad).toFixed(4)}</td>
                    <td style={s.tdRight}>{Number(r.costoUnitario).toFixed(4)}</td>
                    <td style={s.tdRight}>{Number(r.costoTotal).toFixed(2)}</td>
                    <td style={s.tdRight}>{Number(r.saldoCantidad).toFixed(4)}</td>
                    <td style={s.tdRight}>{Number(r.saldoCosto).toFixed(2)}</td>
                    <td style={s.tdRight}>{Number(r.saldoCostoUnitario).toFixed(4)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={s.pagination}>
              <span>{total} movimiento{total !== 1 ? "s" : ""}</span>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
                <span>Página {page} de {totalPages}</span>
                <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
