import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";

const CLIENTES_QUERY = gql`
  query Clientes($page: Int, $limit: Int, $search: String) {
    clientes(page: $page, limit: $limit, search: $search) {
      items {
        id
        ruc
        nombre
        contacto
        activo
      }
      total
      page
      limit
    }
  }
`;

const CREAR_CLIENTE = gql`
  mutation CrearCliente($input: CrearClienteInput!) {
    crearCliente(input: $input) {
      id
    }
  }
`;

const ACTUALIZAR_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $input: ActualizarClienteInput!) {
    actualizarCliente(id: $id, input: $input) {
      id
    }
  }
`;

const TOGGLE_CLIENTE = gql`
  mutation ToggleCliente($id: ID!) {
    toggleCliente(id: $id) {
      id
      activo
    }
  }
`;

interface Cliente {
  id: string;
  ruc: string;
  nombre: string;
  contacto?: string | null;
  activo: boolean;
}

interface FormState {
  ruc: string;
  nombre: string;
  contacto: string;
}

const FORM_VACIO: FormState = { ruc: "", nombre: "", contacto: "" };
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
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" } as React.CSSProperties,
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
};

export function ClientesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [formError, setFormError] = useState("");

  const { data, loading, refetch } = useQuery(CLIENTES_QUERY, {
    variables: { page, limit: LIMIT, search: search || undefined },
    fetchPolicy: "cache-and-network",
  });

  const [crearCliente, { loading: creando }] = useMutation(CREAR_CLIENTE);
  const [actualizarCliente, { loading: actualizando }] = useMutation(ACTUALIZAR_CLIENTE);
  const [toggleCliente] = useMutation(TOGGLE_CLIENTE);

  const clientes: Cliente[] = data?.clientes?.items ?? [];
  const total: number = data?.clientes?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const guardando = creando || actualizando;

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
    setModalOpen(true);
  }

  function abrirEditar(c: Cliente) {
    setEditandoId(c.id);
    setForm({ ruc: c.ruc, nombre: c.nombre, contacto: c.contacto ?? "" });
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
      ruc: form.ruc.trim(),
      nombre: form.nombre.trim(),
      ...(form.contacto.trim() && { contacto: form.contacto.trim() }),
    };

    if (!input.ruc || !input.nombre) {
      setFormError("RUC y nombre son obligatorios.");
      return;
    }
    if (!/^\d{11}$/.test(input.ruc)) {
      setFormError("El RUC debe tener 11 dígitos.");
      return;
    }

    try {
      if (editandoId) {
        await actualizarCliente({ variables: { id: editandoId, input } });
      } else {
        await crearCliente({ variables: { input } });
      }
      cerrarModal();
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setFormError(msg);
    }
  }

  async function handleToggle(id: string) {
    await toggleCliente({ variables: { id } });
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
        <h1 style={s.title}>Clientes</h1>
        <button style={s.btnPrimary} onClick={abrirCrear}>+ Nuevo Cliente</button>
      </div>

      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.input}
          placeholder="Buscar por RUC o nombre..."
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
            <th style={s.th}>RUC</th>
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Contacto</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 && !loading ? (
            <tr>
              <td colSpan={5} style={s.emptyRow}>
                {search ? `No se encontraron resultados para "${search}"` : "No hay clientes registrados."}
              </td>
            </tr>
          ) : (
            clientes.map((c) => (
              <tr key={c.id}>
                <td style={s.td}><strong>{c.ruc}</strong></td>
                <td style={s.td}>{c.nombre}</td>
                <td style={s.td}>{c.contacto || <span style={{ color: "#7a95aa" }}>—</span>}</td>
                <td style={s.td}>
                  <span style={s.badge(c.activo)}>{c.activo ? "Activo" : "Inactivo"}</span>
                </td>
                <td style={s.td}>
                  <button style={s.btnSecondary} onClick={() => abrirEditar(c)}>Editar</button>
                  <button
                    style={c.activo ? s.btnDanger : s.btnSecondary}
                    onClick={() => handleToggle(c.id)}
                  >
                    {c.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <span>{total} cliente{total !== 1 ? "s" : ""}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </div>
      )}

      {!totalPages || totalPages <= 1 ? (
        <div style={{ ...s.pagination, justifyContent: "flex-start" }}>
          <span style={{ color: "#7a95aa" }}>{total} cliente{total !== 1 ? "s" : ""}</span>
        </div>
      ) : null}

      {modalOpen && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editandoId ? "Editar Cliente" : "Nuevo Cliente"}</h2>

            {formError && <div style={s.errorBox}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>RUC *</label>
                <input
                  style={s.inputFull}
                  value={form.ruc}
                  onChange={(e) => setField("ruc", e.target.value.replace(/\D/g, ""))}
                  placeholder="11 dígitos"
                  maxLength={11}
                  inputMode="numeric"
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Razón Social *</label>
                <input
                  style={s.inputFull}
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Nombre o razón social"
                  maxLength={200}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Contacto</label>
                <input
                  style={s.inputFull}
                  value={form.contacto}
                  onChange={(e) => setField("contacto", e.target.value)}
                  placeholder="Persona, teléfono o correo (opcional)"
                  maxLength={200}
                />
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={guardando}>
                  {guardando ? "Guardando..." : editandoId ? "Guardar Cambios" : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
