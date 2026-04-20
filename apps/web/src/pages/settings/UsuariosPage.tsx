import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const USUARIOS_QUERY = gql`
  query Usuarios($page: Int, $limit: Int, $search: String) {
    usuarios(page: $page, limit: $limit, search: $search) {
      items {
        id
        nombre
        email
        rol
        activo
      }
      total
      page
      limit
    }
  }
`;

const CREAR_USUARIO = gql`
  mutation CrearUsuario($input: CrearUsuarioInput!) {
    crearUsuario(input: $input) {
      id
    }
  }
`;

const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario($id: ID!, $input: ActualizarUsuarioInput!) {
    actualizarUsuario(id: $id, input: $input) {
      id
    }
  }
`;

const TOGGLE_USUARIO = gql`
  mutation ToggleUsuario($id: ID!) {
    toggleUsuario(id: $id) {
      id
      activo
    }
  }
`;

type Rol = "admin" | "operador";

const ROL_LABEL: Record<Rol, string> = { admin: "Administrador", operador: "Operador" };

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

interface FormState {
  nombre: string;
  email: string;
  rol: Rol;
}

const FORM_VACIO: FormState = { nombre: "", email: "", rol: "operador" };
const LIMIT = 10;

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", marginRight: 6 } as React.CSSProperties,
  btnDanger: { background: "#fce8e8", color: "#c0392b", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  btnDisabled: { background: "#f0f2f5", color: "#b0b8c1", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "not-allowed", fontSize: "0.85rem" } as React.CSSProperties,
  searchRow: { display: "flex", gap: "0.5rem", marginBottom: "1rem" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", flex: 1 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.9rem" },
  th: { textAlign: "left" as const, padding: "0.6rem 0.75rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase" as const },
  td: { padding: "0.7rem 0.75rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  badge: (activo: boolean): React.CSSProperties => ({
    display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
    background: activo ? "#e6f4ea" : "#fce8e8", color: activo ? "#27ae60" : "#c0392b",
  }),
  rolBadge: (rol: Rol): React.CSSProperties => ({
    display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600,
    background: rol === "admin" ? "#e8e4f9" : "#e8edf2",
    color: rol === "admin" ? "#5f3dc4" : "#4a6580",
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
  infoNote: { background: "#eef5fc", color: "#2563a0", fontSize: "0.8rem", padding: "0.5rem 0.75rem", borderRadius: 6, marginBottom: "1rem" } as React.CSSProperties,
};

export function UsuariosPage() {
  const { usuario: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [formError, setFormError] = useState("");

  const { data, loading, refetch } = useQuery(USUARIOS_QUERY, {
    variables: { page, limit: LIMIT, search: search || undefined },
    fetchPolicy: "cache-and-network",
  });

  const [crearUsuario, { loading: creando }] = useMutation(CREAR_USUARIO);
  const [actualizarUsuario, { loading: actualizando }] = useMutation(ACTUALIZAR_USUARIO);
  const [toggleUsuario] = useMutation(TOGGLE_USUARIO);

  const usuarios: Usuario[] = data?.usuarios?.items ?? [];
  const total: number = data?.usuarios?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const guardando = creando || actualizando;

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
    setModalOpen(true);
  }

  function abrirEditar(u: Usuario) {
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, email: u.email, rol: u.rol });
    setFormError("");
    setModalOpen(true);
  }

  function cerrarModal() {
    setModalOpen(false);
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const input = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      rol: form.rol,
    };

    if (!input.nombre || !input.email) {
      setFormError("Nombre y email son obligatorios.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      setFormError("Email inválido.");
      return;
    }

    try {
      if (editandoId) {
        await actualizarUsuario({ variables: { id: editandoId, input } });
      } else {
        await crearUsuario({ variables: { input } });
      }
      cerrarModal();
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setFormError(msg);
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleUsuario({ variables: { id } });
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      alert(msg);
    }
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
        <h1 style={s.title}>Usuarios</h1>
        <button style={s.btnPrimary} onClick={abrirCrear}>+ Nuevo Usuario</button>
      </div>

      <div style={s.infoNote}>
        Los usuarios ingresan al sistema con su email (sin contraseña) — reciben un código de 6 dígitos por correo cada vez.
      </div>

      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.input}
          placeholder="Buscar por nombre o email..."
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
            <th style={s.th}>Nombre</th>
            <th style={s.th}>Email</th>
            <th style={s.th}>Rol</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 && !loading ? (
            <tr>
              <td colSpan={5} style={s.emptyRow}>
                {search ? `No se encontraron resultados para "${search}"` : "No hay usuarios registrados."}
              </td>
            </tr>
          ) : (
            usuarios.map((u) => {
              const esPropio = u.id === currentUser?.id;
              return (
                <tr key={u.id}>
                  <td style={s.td}>
                    <strong>{u.nombre}</strong>
                    {esPropio && <span style={{ color: "#7a95aa", fontSize: "0.75rem", marginLeft: 6 }}>(tú)</span>}
                  </td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}><span style={s.rolBadge(u.rol)}>{ROL_LABEL[u.rol]}</span></td>
                  <td style={s.td}>
                    <span style={s.badge(u.activo)}>{u.activo ? "Activo" : "Inactivo"}</span>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnSecondary} onClick={() => abrirEditar(u)}>Editar</button>
                    {esPropio ? (
                      <button
                        style={s.btnDisabled}
                        disabled
                        title="No puedes desactivar tu propia cuenta"
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    ) : (
                      <button
                        style={u.activo ? s.btnDanger : s.btnSecondary}
                        onClick={() => handleToggle(u.id)}
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <span>{total} usuario{total !== 1 ? "s" : ""}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </div>
      )}

      {!totalPages || totalPages <= 1 ? (
        <div style={{ ...s.pagination, justifyContent: "flex-start" }}>
          <span style={{ color: "#7a95aa" }}>{total} usuario{total !== 1 ? "s" : ""}</span>
        </div>
      ) : null}

      {modalOpen && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editandoId ? "Editar Usuario" : "Nuevo Usuario"}</h2>

            {formError && <div style={s.errorBox}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Nombre *</label>
                <input
                  style={s.inputFull}
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Nombre completo"
                  maxLength={120}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Email *</label>
                <input
                  style={s.inputFull}
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="correo@empresa.com"
                  maxLength={255}
                  required
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Rol *</label>
                <select
                  style={s.select}
                  value={form.rol}
                  onChange={(e) => setField("rol", e.target.value as Rol)}
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={guardando}>
                  {guardando ? "Guardando..." : editandoId ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
