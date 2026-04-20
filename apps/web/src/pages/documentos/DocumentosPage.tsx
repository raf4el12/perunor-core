import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { Link, useNavigate } from "react-router-dom";

const DOCUMENTOS_QUERY = gql`
  query Documentos($page: Int, $limit: Int, $tipo: TipoDocumento, $estado: EstadoDocumento, $search: String) {
    documentos(page: $page, limit: $limit, tipo: $tipo, estado: $estado, search: $search) {
      items {
        id
        tipo
        numero
        fecha
        estado
        total
        proveedor { nombre }
        cliente { nombre }
        almacen { nombre }
      }
      total
      page
      limit
    }
  }
`;

type Tipo = "compra" | "procesamiento" | "salida" | "factura";
type Estado = "borrador" | "confirmado" | "anulado";

interface DocumentoRow {
  id: string;
  tipo: Tipo;
  numero: string | null;
  fecha: string;
  estado: Estado;
  total: string;
  proveedor?: { nombre: string } | null;
  cliente?: { nombre: string } | null;
  almacen?: { nombre: string } | null;
}

const LIMIT = 10;
const TIPOS: { value: Tipo; label: string }[] = [
  { value: "compra", label: "Compra" },
  { value: "procesamiento", label: "Procesamiento" },
  { value: "salida", label: "Salida" },
  { value: "factura", label: "Factura" },
];
const ESTADOS: { value: Estado; label: string }[] = [
  { value: "borrador", label: "Borrador" },
  { value: "confirmado", label: "Confirmado" },
  { value: "anulado", label: "Anulado" },
];

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", marginRight: 6 } as React.CSSProperties,
  filters: { display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" as const },
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", flex: 1, minWidth: 180 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.9rem" },
  th: { textAlign: "left" as const, padding: "0.6rem 0.75rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase" as const },
  td: { padding: "0.7rem 0.75rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  badge: (estado: Estado): React.CSSProperties => {
    const colors: Record<Estado, { bg: string; fg: string }> = {
      borrador: { bg: "#fff3cd", fg: "#8a6d3b" },
      confirmado: { bg: "#e6f4ea", fg: "#27ae60" },
      anulado: { bg: "#fce8e8", fg: "#c0392b" },
    };
    const c = colors[estado];
    return { display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: c.bg, color: c.fg };
  },
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#4a6580" } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
};

export function DocumentosPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState<Tipo | "">("");
  const [estado, setEstado] = useState<Estado | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, loading } = useQuery(DOCUMENTOS_QUERY, {
    variables: {
      page,
      limit: LIMIT,
      tipo: tipo || undefined,
      estado: estado || undefined,
      search: search || undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const documentos: DocumentoRow[] = data?.documentos?.items ?? [];
  const total: number = data?.documentos?.total ?? 0;
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
        <h1 style={s.title}>Documentos</h1>
        <button style={s.btnPrimary} onClick={() => navigate("/documentos/nuevo")}>
          + Nuevo Documento
        </button>
      </div>

      <form onSubmit={handleSearch} style={s.filters}>
        <select style={s.select} value={tipo} onChange={(e) => { setTipo(e.target.value as Tipo | ""); setPage(1); }}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select style={s.select} value={estado} onChange={(e) => { setEstado(e.target.value as Estado | ""); setPage(1); }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
        <input
          style={s.input}
          placeholder="Buscar por número..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" style={s.btnPrimary}>Buscar</button>
      </form>

      {loading && <p style={{ color: "#7a95aa" }}>Cargando...</p>}

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Número</th>
            <th style={s.th}>Tipo</th>
            <th style={s.th}>Fecha</th>
            <th style={s.th}>Contraparte</th>
            <th style={s.th}>Almacén</th>
            <th style={s.th}>Total</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documentos.length === 0 && !loading ? (
            <tr>
              <td colSpan={8} style={s.emptyRow}>No hay documentos.</td>
            </tr>
          ) : (
            documentos.map((d) => (
              <tr key={d.id}>
                <td style={s.td}><strong>{d.numero ?? "—"}</strong></td>
                <td style={s.td}>{TIPOS.find((t) => t.value === d.tipo)?.label ?? d.tipo}</td>
                <td style={s.td}>{d.fecha}</td>
                <td style={s.td}>{d.proveedor?.nombre ?? d.cliente?.nombre ?? <span style={{ color: "#7a95aa" }}>—</span>}</td>
                <td style={s.td}>{d.almacen?.nombre ?? "—"}</td>
                <td style={s.td}>{Number(d.total).toFixed(2)}</td>
                <td style={s.td}><span style={s.badge(d.estado)}>{ESTADOS.find((e) => e.value === d.estado)?.label}</span></td>
                <td style={s.td}>
                  <button style={s.btnSecondary} onClick={() => navigate(`/documentos/${d.id}`)}>
                    {d.estado === "borrador" ? "Editar" : "Ver"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <span>{total} documento{total !== 1 ? "s" : ""}</span>
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
