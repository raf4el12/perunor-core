import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Link } from "react-router-dom";

const CATALOGOS_QUERY = gql`
  query CatalogosStock {
    almacenes(page: 1, limit: 100) { items { id nombre } }
  }
`;

const STOCK_QUERY = gql`
  query StockActual($almacenId: ID, $search: String, $page: Int, $limit: Int) {
    stockActual(almacenId: $almacenId, search: $search, page: $page, limit: $limit) {
      items {
        articuloId
        almacenId
        cantidad
        costo
        costoUnitario
        ultimaFecha
        articulo { id codigo nombre unidadMedida }
        almacen { id nombre }
      }
      total
      page
      limit
    }
  }
`;

interface StockRow {
  articuloId: string;
  almacenId: string;
  cantidad: string;
  costo: string;
  costoUnitario: string;
  ultimaFecha: string | null;
  articulo: { id: string; codigo: string; nombre: string; unidadMedida: string } | null;
  almacen: { id: string; nombre: string } | null;
}

const LIMIT = 50;

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  filters: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" as const },
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", flex: 1, minWidth: 220 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.9rem" },
  th: { textAlign: "left" as const, padding: "0.55rem 0.75rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  thRight: { textAlign: "right" as const, padding: "0.55rem 0.75rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  td: { padding: "0.55rem 0.75rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  tdRight: { padding: "0.55rem 0.75rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const, textAlign: "right" as const, fontVariantNumeric: "tabular-nums" as const },
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#4a6580" } as React.CSSProperties,
  neg: { color: "#c0392b", fontWeight: 600 } as React.CSSProperties,
};

export function StockPage() {
  const [almacenId, setAlmacenId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: catalogos } = useQuery(CATALOGOS_QUERY);
  const { data, loading } = useQuery(STOCK_QUERY, {
    variables: {
      almacenId: almacenId || undefined,
      search: search || undefined,
      page,
      limit: LIMIT,
    },
    fetchPolicy: "cache-and-network",
  });

  const almacenes = catalogos?.almacenes?.items ?? [];
  const items: StockRow[] = data?.stockActual?.items ?? [];
  const total: number = data?.stockActual?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div style={s.page}>
      <Link to="/" style={s.backLink}>← Inicio</Link>

      <div style={s.header}>
        <h1 style={s.title}>Stock actual</h1>
      </div>

      <form onSubmit={handleSearch} style={s.filters}>
        <select style={s.select} value={almacenId} onChange={(e) => { setAlmacenId(e.target.value); setPage(1); }}>
          <option value="">Todos los almacenes</option>
          {almacenes.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <input
          style={s.input}
          placeholder="Buscar artículo por código o nombre..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" style={s.btnPrimary}>Buscar</button>
      </form>

      {loading && <p style={{ color: "#7a95aa" }}>Cargando...</p>}

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Código</th>
            <th style={s.th}>Artículo</th>
            <th style={s.th}>Almacén</th>
            <th style={s.thRight}>Cantidad</th>
            <th style={s.th}>Unidad</th>
            <th style={s.thRight}>Costo unit.</th>
            <th style={s.thRight}>Valor</th>
            <th style={s.th}>Últ. mov.</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && !loading ? (
            <tr><td colSpan={8} style={s.emptyRow}>Sin stock registrado.</td></tr>
          ) : (
            items.map((r) => {
              const cant = Number(r.cantidad);
              return (
                <tr key={`${r.articuloId}-${r.almacenId}`}>
                  <td style={s.td}><strong>{r.articulo?.codigo ?? "—"}</strong></td>
                  <td style={s.td}>{r.articulo?.nombre ?? "—"}</td>
                  <td style={s.td}>{r.almacen?.nombre ?? "—"}</td>
                  <td style={{ ...s.tdRight, ...(cant < 0 ? s.neg : {}) }}>{cant.toFixed(4)}</td>
                  <td style={s.td}>{r.articulo?.unidadMedida ?? "—"}</td>
                  <td style={s.tdRight}>{Number(r.costoUnitario).toFixed(4)}</td>
                  <td style={s.tdRight}>{Number(r.costo).toFixed(2)}</td>
                  <td style={s.td}>{r.ultimaFecha ? new Date(r.ultimaFecha).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <span>{total} registro{total !== 1 ? "s" : ""}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </div>
      )}
    </div>
  );
}
