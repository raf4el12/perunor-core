import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";

const CONDUCTORES_QUERY = gql`
  query Conductores($page: Int, $limit: Int, $search: String) {
    conductores(page: $page, limit: $limit, search: $search) {
      items {
        id
        dni
        nombres
        apellidos
        licencia
        telefono
        placaVehiculo
        activo
      }
      total
      page
      limit
    }
  }
`;

const CREAR_CONDUCTOR = gql`
  mutation CrearConductor($input: CrearConductorInput!) {
    crearConductor(input: $input) {
      id
    }
  }
`;

const ACTUALIZAR_CONDUCTOR = gql`
  mutation ActualizarConductor($id: ID!, $input: ActualizarConductorInput!) {
    actualizarConductor(id: $id, input: $input) {
      id
    }
  }
`;

const TOGGLE_CONDUCTOR = gql`
  mutation ToggleConductor($id: ID!) {
    toggleConductor(id: $id) {
      id
      activo
    }
  }
`;

interface Conductor {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  licencia?: string | null;
  telefono?: string | null;
  placaVehiculo?: string | null;
  activo: boolean;
}

interface FormState {
  dni: string;
  nombres: string;
  apellidos: string;
  licencia: string;
  telefono: string;
  placaVehiculo: string;
}

const FORM_VACIO: FormState = { dni: "", nombres: "", apellidos: "", licencia: "", telefono: "", placaVehiculo: "" };
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
  modal: { background: "#fff", borderRadius: 10, padding: "2rem", width: "100%", maxWidth: 520, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" } as React.CSSProperties,
  modalTitle: { margin: "0 0 1.5rem", color: "#1a3a5c", fontSize: "1.2rem" } as React.CSSProperties,
  field: { marginBottom: "1rem" } as React.CSSProperties,
  label: { display: "block", marginBottom: "0.3rem", fontSize: "0.85rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  inputFull: { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", boxSizing: "border-box" as const },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" } as React.CSSProperties,
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  emptyRow: { textAlign: "center" as const, color: "#7a95aa", padding: "2rem" },
  row2: { display: "flex", gap: "1rem" } as React.CSSProperties,
  col: { flex: 1 } as React.CSSProperties,
};

export function ConductoresPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [formError, setFormError] = useState("");

  const { data, loading, refetch } = useQuery(CONDUCTORES_QUERY, {
    variables: { page, limit: LIMIT, search: search || undefined },
    fetchPolicy: "cache-and-network",
  });

  const [crearConductor, { loading: creando }] = useMutation(CREAR_CONDUCTOR);
  const [actualizarConductor, { loading: actualizando }] = useMutation(ACTUALIZAR_CONDUCTOR);
  const [toggleConductor] = useMutation(TOGGLE_CONDUCTOR);

  const conductores: Conductor[] = data?.conductores?.items ?? [];
  const total: number = data?.conductores?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const guardando = creando || actualizando;

  function abrirCrear() {
    setEditandoId(null);
    setForm(FORM_VACIO);
    setFormError("");
    setModalOpen(true);
  }

  function abrirEditar(c: Conductor) {
    setEditandoId(c.id);
    setForm({
      dni: c.dni,
      nombres: c.nombres,
      apellidos: c.apellidos,
      licencia: c.licencia ?? "",
      telefono: c.telefono ?? "",
      placaVehiculo: c.placaVehiculo ?? "",
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
      dni: form.dni.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      ...(form.licencia.trim() && { licencia: form.licencia.trim() }),
      ...(form.telefono.trim() && { telefono: form.telefono.trim() }),
      ...(form.placaVehiculo.trim() && { placaVehiculo: form.placaVehiculo.trim().toUpperCase() }),
    };

    if (!input.dni || !input.nombres || !input.apellidos) {
      setFormError("DNI, nombres y apellidos son obligatorios.");
      return;
    }
    if (!/^\d{8}$/.test(input.dni)) {
      setFormError("El DNI debe tener 8 dígitos.");
      return;
    }

    try {
      if (editandoId) {
        await actualizarConductor({ variables: { id: editandoId, input } });
      } else {
        await crearConductor({ variables: { input } });
      }
      cerrarModal();
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setFormError(msg);
    }
  }

  async function handleToggle(id: string) {
    await toggleConductor({ variables: { id } });
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
        <h1 style={s.title}>Conductores</h1>
        <button style={s.btnPrimary} onClick={abrirCrear}>+ Nuevo Conductor</button>
      </div>

      <form onSubmit={handleSearch} style={s.searchRow}>
        <input
          style={s.input}
          placeholder="Buscar por DNI, nombres o apellidos..."
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
            <th style={s.th}>DNI</th>
            <th style={s.th}>Nombre Completo</th>
            <th style={s.th}>Licencia</th>
            <th style={s.th}>Teléfono</th>
            <th style={s.th}>Placa</th>
            <th style={s.th}>Estado</th>
            <th style={s.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conductores.length === 0 && !loading ? (
            <tr>
              <td colSpan={7} style={s.emptyRow}>
                {search ? `No se encontraron resultados para "${search}"` : "No hay conductores registrados."}
              </td>
            </tr>
          ) : (
            conductores.map((c) => (
              <tr key={c.id}>
                <td style={s.td}><strong>{c.dni}</strong></td>
                <td style={s.td}>{c.apellidos}, {c.nombres}</td>
                <td style={s.td}>{c.licencia || <span style={{ color: "#7a95aa" }}>—</span>}</td>
                <td style={s.td}>{c.telefono || <span style={{ color: "#7a95aa" }}>—</span>}</td>
                <td style={s.td}>{c.placaVehiculo || <span style={{ color: "#7a95aa" }}>—</span>}</td>
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
          <span>{total} conductor{total !== 1 ? "es" : ""}</span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button style={s.btnSecondary} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</button>
            <span>Página {page} de {totalPages}</span>
            <button style={s.btnSecondary} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </div>
      )}

      {!totalPages || totalPages <= 1 ? (
        <div style={{ ...s.pagination, justifyContent: "flex-start" }}>
          <span style={{ color: "#7a95aa" }}>{total} conductor{total !== 1 ? "es" : ""}</span>
        </div>
      ) : null}

      {modalOpen && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editandoId ? "Editar Conductor" : "Nuevo Conductor"}</h2>

            {formError && <div style={s.errorBox}>{formError}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>DNI *</label>
                <input
                  style={s.inputFull}
                  value={form.dni}
                  onChange={(e) => setField("dni", e.target.value.replace(/\D/g, ""))}
                  placeholder="8 dígitos"
                  maxLength={8}
                  inputMode="numeric"
                  required
                />
              </div>

              <div style={s.row2}>
                <div style={{ ...s.field, ...s.col }}>
                  <label style={s.label}>Nombres *</label>
                  <input
                    style={s.inputFull}
                    value={form.nombres}
                    onChange={(e) => setField("nombres", e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
                <div style={{ ...s.field, ...s.col }}>
                  <label style={s.label}>Apellidos *</label>
                  <input
                    style={s.inputFull}
                    value={form.apellidos}
                    onChange={(e) => setField("apellidos", e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
              </div>

              <div style={s.row2}>
                <div style={{ ...s.field, ...s.col }}>
                  <label style={s.label}>Licencia de conducir</label>
                  <input
                    style={s.inputFull}
                    value={form.licencia}
                    onChange={(e) => setField("licencia", e.target.value)}
                    placeholder="Número de brevete"
                    maxLength={20}
                  />
                </div>
                <div style={{ ...s.field, ...s.col }}>
                  <label style={s.label}>Teléfono</label>
                  <input
                    style={s.inputFull}
                    value={form.telefono}
                    onChange={(e) => setField("telefono", e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>Placa del vehículo</label>
                <input
                  style={s.inputFull}
                  value={form.placaVehiculo}
                  onChange={(e) => setField("placaVehiculo", e.target.value.toUpperCase())}
                  placeholder="ABC-123"
                  maxLength={10}
                />
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.btnSecondary} onClick={cerrarModal}>Cancelar</button>
                <button type="submit" style={s.btnPrimary} disabled={guardando}>
                  {guardando ? "Guardando..." : editandoId ? "Guardar Cambios" : "Crear Conductor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
