import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";

const ARTICULOS_QUERY = gql`
  query Articulos($page: Int, $limit: Int, $search: String) {
    articulos(page: $page, limit: $limit, search: $search) {
      items {
        id
        codigo
        nombre
        descripcion
        unidadMedida
        categoria
        activo
      }
      total
      page
      limit
    }
  }
`;

const CREAR_ARTICULO = gql`
  mutation CrearArticulo($input: CrearArticuloInput!) {
    crearArticulo(input: $input) {
      id
    }
  }
`;

const ACTUALIZAR_ARTICULO = gql`
  mutation ActualizarArticulo($id: ID!, $input: ActualizarArticuloInput!) {
    actualizarArticulo(id: $id, input: $input) {
      id
    }
  }
`;

const TOGGLE_ARTICULO = gql`
  mutation ToggleArticulo($id: ID!) {
    toggleArticulo(id: $id) {
      id
      activo
    }
  }
`;

const CATEGORIAS: Record<string, string> = {
  materia_prima: "Materia Prima",
  insumo: "Insumo",
  producto_terminado: "Producto Terminado",
  empaque: "Empaque",
};

const UNIDADES = ["kg", "tn", "saco", "caja", "unidad", "litro", "g", "m"];

interface Articulo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  categoria: string;
  activo: boolean;
}

interface FormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  unidadMedida: string;
  categoria: string;
}

const FORM_VACIO: FormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  unidadMedida: "kg",
  categoria: "materia_prima",
};

const LIMIT = 10;

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", marginRight: 6 } as React.CSSProperties,
  btnDanger: { background: "#fce8e8", color: "#c0392b", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  searchRow: { display: "flex", gap: "0.5rem", marginBottom: "1rem" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", flex: 1 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.9rem" },
  th: { textAlign: "left" as const, padding: "0.6rem 0.75rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase" as const },
  td: { padding: "0.7rem 0.75rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  badge: (activo: boolean): React.CSSProperties => ({
    display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
    background: activo ? "#e6f4ea" : "#fce8e8", color: activo ? "#27ae60" : "#c0392b",
  }),
  pagination: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.85rem", color: "#4a6580" } as React.CSSProperties,
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 10, padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" } as React.CSSProperties,
  modalTitle: { margin: "0 0 1.5rem", color: "#1a3a5c", fontSize: "1.2rem" } as React.CSSProperties,
  field: { marginBottom: "1rem" } as React.CSSProperties,
  label: { display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  inputFull: { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" as const },
  select: { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", background: "#fff", boxSizing: "border-box" as const },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" } as React.CSSProperties,
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
};

export function ArticulosPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [formError, setFormError] = useState("");

  const { data, loading, refetch } = useQuery(ARTICULOS_QUERY, {
    variables: { page, limit: LIMIT, search: search || undefined },
    fetchPolicy: "cache-and-network",
  });

  const [crearArticulo, { loading: creando }] = useMutation(CREAR_ARTICULO);
  const [actualizarArticulo, { loading: actualizando }] = useMutation(ACTUALIZAR_ARTICULO);
  const [toggleArticulo] = useMutation(TOGGLE_ARTICULO);

  const articulos: Articulo[] = data?.articulos?.items ?? [];
  const total: number = data?.articulos?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const guardando = creando || actualizando;

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
    setModalOpen(true);
  }

  function abrirEditar(art: Articulo) {
    setEditandoId(art.id);
    setForm({
      codigo: art.codigo,
      nombre: art.nombre,
      descripcion: art.descripcion ?? "",
      unidadMedida: art.unidadMedida,
      categoria: art.categoria,
    });
    setFormError("");
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
  }

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const input = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      ...(form.descripcion.trim() && { descripcion: form.descripcion.trim() }),
      unidadMedida: form.unidadMedida.trim(),
      categoria: form.categoria,
    };

    if (!input.codigo || !input.nombre || !input.unidadMedida) {
      setFormError("Código, nombre y unidad de medida son obligatorios.");
      return;
    }

    try {
      if (editandoId) {
        await actualizarArticulo({ variables: { id: editandoId, input } });
      } else {
        await crearArticulo({ variables: { input } });
      }
      cerrarModal();
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setFormError(msg);
    }
  }

  async function handleToggle(id: string) {
    await toggleArticulo({ variables: { id } });
    refetch();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  return (
    <div style={s.page}>
      <Link to="/" style={s.backLink}>← Inicio</Link>

      <div style={s.header}>
        <h1 style={s.title}>Artículos</h1>
        <button style={s.btnPrimary} onClick={abrirCrear}>+ Nuevo Artículo</button>
      </div>

      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.input}
          placeholder="Buscar por código o nombre..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" style={s.btnPrimary}>Buscar</button>
        {search && (
          <button type="button" style={s.btnSecondary} onClick={handleClearSearch}>Limpiar</button>
        )}
      </form>

      {loading && <p style={{ color: "#7a95aa" }}>Cargando...</p>}

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Código</th>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Categoría</th>
            <th style={s.th}>Unidad</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.length === 0 && !loading ? (
            <tr>
              <td colSpan={6} style={s.emptyRow}>
                {search ? `No se encontraron resultados para "${search}"` : "No hay artículos registrados."}
              </td>
            </tr>
          ) : (
            articulos.map((art) => (
              <tr key={art.id}>
                <td style={s.td}><strong>{art.codigo}</strong></td>
                <td style={s.td}>
                  {art.nombre}
                  {art.descripcion && <div style={{ fontSize: "0.8rem", color: "#7a95aa" }}>{art.descripcion}</div>}
                </td>
                <td style={s.td}>{CATEGORIAS[art.categoria] ?? art.categoria}</td>
                <td style={s.td}>{art.unidadMedida}</td>
                <td style={s.td}>
                  <span style={s.badge(art.activo)}>{art.activo ? "Activo" : "Inactivo"}</span>
                </td>
                <td style={s.td}>
                  <button style={s.btnSecondary} onClick={() => abrirEditar(art)}>Editar</button>
                  <button
                    style={art.activo ? s.btnDanger : s.btnSecondary}
                    onClick={() => handleToggle(art.id)}
                  >
                    {art.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <span>{total} artículo{total !== 1 ? "s" : ""}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </div>
      )}

      {!totalPages || totalPages <= 1 ? (
        <div style={{ ...s.pagination, justifyContent: "flex-start" }}>
          <span style={{ color: "#7a95aa" }}>{total} artículo{total !== 1 ? "s" : ""}</span>
        </div>
      ) : null}

      {modalOpen && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editandoId ? "Editar Artículo" : "Nuevo Artículo"}</h2>

            {formError && <div style={s.errorBox}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Código *</label>
                <input
                  style={s.inputFull}
                  value={form.codigo}
                  onChange={(e) => setField("codigo", e.target.value)}
                  placeholder="Ej: ART-001"
                  maxLength={50}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Nombre *</label>
                <input
                  style={s.inputFull}
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Nombre del artículo"
                  maxLength={200}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Descripción</label>
                <input
                  style={s.inputFull}
                  value={form.descripcion}
                  onChange={(e) => setField("descripcion", e.target.value)}
                  placeholder="Descripción opcional"
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Unidad de Medida *</label>
                  <select
                    style={s.select}
                    value={UNIDADES.includes(form.unidadMedida) ? form.unidadMedida : "__custom"}
                    onChange={(e) => {
                      if (e.target.value !== "__custom") setField("unidadMedida", e.target.value);
                    }}
                  >
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                    {!UNIDADES.includes(form.unidadMedida) && (
                      <option value="__custom">{form.unidadMedida} (personalizado)</option>
                    )}
                  </select>
                  <input
                    style={{ ...s.inputFull, marginTop: "0.4rem" }}
                    value={form.unidadMedida}
                    onChange={(e) => setField("unidadMedida", e.target.value)}
                    placeholder="O escribe otra unidad"
                    maxLength={20}
                  />
                </div>

                <div style={{ ...s.field, flex: 1 }}>
                  <label style={s.label}>Categoría *</label>
                  <select
                    style={s.select}
                    value={form.categoria}
                    onChange={(e) => setField("categoria", e.target.value)}
                  >
                    {Object.entries(CATEGORIAS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={guardando}>
                  {guardando ? "Guardando..." : editandoId ? "Guardar Cambios" : "Crear Artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
