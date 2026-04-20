import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link, useNavigate, useParams } from "react-router-dom";

const DOCUMENTO_QUERY = gql`
  query Documento($id: ID!) {
    documento(id: $id) {
      id
      tipo
      numero
      fecha
      estado
      observaciones
      proveedorId
      clienteId
      almacenId
      almacenDestinoId
      conductorId
      procesoId
      subtotal
      igv
      total
      confirmadoEn
      anuladoEn
      lineas {
        id
        articuloId
        procesoId
        movimiento
        cantidad
        unidad
        precioUnitario
        subtotal
      }
    }
  }
`;

const CATALOGOS_QUERY = gql`
  query CatalogosDocumento {
    articulos(page: 1, limit: 200) { items { id codigo nombre unidadMedida } }
    almacenes(page: 1, limit: 100) { items { id nombre } }
    procesos(page: 1, limit: 100) { items { id nombre } }
    proveedores(page: 1, limit: 200) { items { id ruc nombre } }
    clientes(page: 1, limit: 200) { items { id ruc nombre } }
    conductores(page: 1, limit: 200) { items { id dni nombres apellidos } }
  }
`;

const CREAR_DOCUMENTO = gql`
  mutation CrearDocumento($input: CrearDocumentoInput!) {
    crearDocumento(input: $input) { id }
  }
`;

const ACTUALIZAR_DOCUMENTO = gql`
  mutation ActualizarDocumento($id: ID!, $input: ActualizarDocumentoInput!) {
    actualizarDocumento(id: $id, input: $input) { id }
  }
`;

const CONFIRMAR_DOCUMENTO = gql`
  mutation ConfirmarDocumento($id: ID!) {
    confirmarDocumento(id: $id) { id estado numero }
  }
`;

const ANULAR_DOCUMENTO = gql`
  mutation AnularDocumento($id: ID!, $motivo: String) {
    anularDocumento(id: $id, motivo: $motivo) { id estado }
  }
`;

const ELIMINAR_DOCUMENTO = gql`
  mutation EliminarDocumento($id: ID!) {
    eliminarDocumento(id: $id)
  }
`;

type Tipo = "compra" | "procesamiento" | "salida" | "factura";
type Movimiento = "ingreso" | "egreso";

interface LineaForm {
  articuloId: string;
  procesoId: string;
  movimiento: Movimiento;
  cantidad: string;
  unidad: string;
  precioUnitario: string;
}

const LINEA_VACIA: LineaForm = {
  articuloId: "",
  procesoId: "",
  movimiento: "ingreso",
  cantidad: "",
  unidad: "",
  precioUnitario: "0",
};

const TIPOS: { value: Tipo; label: string }[] = [
  { value: "compra", label: "Compra" },
  { value: "procesamiento", label: "Procesamiento" },
  { value: "salida", label: "Salida" },
  { value: "factura", label: "Factura" },
];

const IGV = 0.18;

const s = {
  page: { padding: "2rem", fontFamily: "sans-serif", maxWidth: 1100, margin: "0 auto" } as React.CSSProperties,
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" } as React.CSSProperties,
  title: { color: "#1a3a5c", margin: 0, fontSize: "1.5rem" } as React.CSSProperties,
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  btnSecondary: { background: "#e8edf2", color: "#1a3a5c", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem", marginRight: 6 } as React.CSSProperties,
  btnDanger: { background: "#fce8e8", color: "#c0392b", border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", cursor: "pointer", fontSize: "0.85rem" } as React.CSSProperties,
  btnSuccess: { background: "#27ae60", color: "#fff", border: "none", borderRadius: 6, padding: "0.5rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" } as React.CSSProperties,
  section: { background: "#fff", border: "1px solid #edf0f4", borderRadius: 10, padding: "1.25rem", marginBottom: "1.25rem" } as React.CSSProperties,
  sectionTitle: { margin: "0 0 1rem", color: "#1a3a5c", fontSize: "1rem" } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" } as React.CSSProperties,
  field: { display: "flex", flexDirection: "column" as const, gap: "0.25rem" },
  label: { fontSize: "0.8rem", fontWeight: 600, color: "#4a6580" } as React.CSSProperties,
  input: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", width: "100%", boxSizing: "border-box" as const },
  select: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", width: "100%", boxSizing: "border-box" as const },
  textarea: { padding: "0.5rem 0.75rem", border: "1px solid #ccd6e0", borderRadius: 6, fontSize: "0.9rem", width: "100%", boxSizing: "border-box" as const, minHeight: 60, fontFamily: "inherit" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.85rem" },
  th: { textAlign: "left" as const, padding: "0.5rem", borderBottom: "2px solid #d0dae5", color: "#4a6580", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" as const },
  td: { padding: "0.4rem", borderBottom: "1px solid #edf0f4", verticalAlign: "middle" as const },
  totals: { display: "flex", justifyContent: "flex-end", gap: "2rem", marginTop: "1rem", fontSize: "0.9rem" } as React.CSSProperties,
  errorBox: { color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem", background: "#fce8e8", padding: "0.5rem 0.75rem", borderRadius: 6 } as React.CSSProperties,
  backLink: { color: "#4a6580", textDecoration: "none", fontSize: "0.85rem", display: "inline-block", marginBottom: "1rem" } as React.CSSProperties,
  badge: (estado: string): React.CSSProperties => {
    const colors: Record<string, { bg: string; fg: string }> = {
      borrador: { bg: "#fff3cd", fg: "#8a6d3b" },
      confirmado: { bg: "#e6f4ea", fg: "#27ae60" },
      anulado: { bg: "#fce8e8", fg: "#c0392b" },
    };
    const c = colors[estado] ?? { bg: "#eee", fg: "#555" };
    return { display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: c.bg, color: c.fg };
  },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", gap: "0.5rem" } as React.CSSProperties,
};

export function DocumentoEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esNuevo = !id || id === "nuevo";

  const [tipo, setTipo] = useState<Tipo>("compra");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [observaciones, setObservaciones] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [almacenId, setAlmacenId] = useState("");
  const [almacenDestinoId, setAlmacenDestinoId] = useState("");
  const [conductorId, setConductorId] = useState("");
  const [procesoId, setProcesoId] = useState("");
  const [lineas, setLineas] = useState<LineaForm[]>([{ ...LINEA_VACIA }]);
  const [error, setError] = useState("");
  const [estadoActual, setEstadoActual] = useState("borrador");
  const [numero, setNumero] = useState<string | null>(null);

  const { data: catalogos } = useQuery(CATALOGOS_QUERY);
  const { data: docData, loading: loadingDoc } = useQuery(DOCUMENTO_QUERY, {
    variables: { id },
    skip: esNuevo,
    fetchPolicy: "cache-and-network",
  });

  const [crearDocumento, { loading: creando }] = useMutation(CREAR_DOCUMENTO);
  const [actualizarDocumento, { loading: actualizando }] = useMutation(ACTUALIZAR_DOCUMENTO);
  const [confirmarDocumento, { loading: confirmando }] = useMutation(CONFIRMAR_DOCUMENTO);
  const [anularDocumento, { loading: anulando }] = useMutation(ANULAR_DOCUMENTO);
  const [eliminarDocumento, { loading: eliminando }] = useMutation(ELIMINAR_DOCUMENTO);

  useEffect(() => {
    const d = docData?.documento;
    if (!d) return;
    setTipo(d.tipo);
    setFecha(d.fecha);
    setObservaciones(d.observaciones ?? "");
    setProveedorId(d.proveedorId ?? "");
    setClienteId(d.clienteId ?? "");
    setAlmacenId(d.almacenId ?? "");
    setAlmacenDestinoId(d.almacenDestinoId ?? "");
    setConductorId(d.conductorId ?? "");
    setProcesoId(d.procesoId ?? "");
    setEstadoActual(d.estado);
    setNumero(d.numero);
    setLineas(
      d.lineas.map((l: any) => ({
        articuloId: l.articuloId,
        procesoId: l.procesoId ?? "",
        movimiento: l.movimiento,
        cantidad: l.cantidad,
        unidad: l.unidad,
        precioUnitario: l.precioUnitario,
      })),
    );
  }, [docData]);

  const articulos = catalogos?.articulos?.items ?? [];
  const almacenes = catalogos?.almacenes?.items ?? [];
  const procesos = catalogos?.procesos?.items ?? [];
  const proveedores = catalogos?.proveedores?.items ?? [];
  const clientes = catalogos?.clientes?.items ?? [];
  const conductores = catalogos?.conductores?.items ?? [];

  const readOnly = !esNuevo && estadoActual !== "borrador";

  const totales = useMemo(() => {
    let subtotal = 0;
    for (const l of lineas) {
      const c = Number(l.cantidad || 0);
      const p = Number(l.precioUnitario || 0);
      subtotal += c * p;
    }
    const igv = subtotal * IGV;
    return { subtotal, igv, total: subtotal + igv };
  }, [lineas]);

  function updateLinea(idx: number, patch: Partial<LineaForm>) {
    setLineas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function addLinea() {
    setLineas((prev) => [...prev, { ...LINEA_VACIA }]);
  }

  function removeLinea(idx: number) {
    setLineas((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function onSeleccionArticulo(idx: number, articuloId: string) {
    const art = articulos.find((a: any) => a.id === articuloId);
    updateLinea(idx, { articuloId, unidad: art?.unidadMedida ?? "" });
  }

  function buildInput() {
    return {
      tipo,
      fecha,
      observaciones: observaciones.trim() || null,
      proveedorId: proveedorId || null,
      clienteId: clienteId || null,
      almacenId,
      almacenDestinoId: almacenDestinoId || null,
      conductorId: conductorId || null,
      procesoId: procesoId || null,
      lineas: lineas.map((l) => ({
        articuloId: l.articuloId,
        procesoId: l.procesoId || null,
        movimiento: l.movimiento,
        cantidad: l.cantidad,
        unidad: l.unidad,
        precioUnitario: l.precioUnitario || "0",
      })),
    };
  }

  function validar(): string | null {
    if (!almacenId) return "Almacén es obligatorio";
    if (tipo === "compra" && !proveedorId) return "Proveedor requerido para compra";
    if ((tipo === "salida" || tipo === "factura") && !clienteId) return "Cliente requerido";
    if (tipo === "procesamiento") {
      if (!almacenDestinoId) return "Almacén destino requerido para procesamiento";
      if (!procesoId) return "Proceso requerido para procesamiento";
    }
    if (lineas.length === 0) return "Al menos una línea";
    for (const [i, l] of lineas.entries()) {
      if (!l.articuloId) return `Línea ${i + 1}: artículo requerido`;
      if (!l.cantidad || Number(l.cantidad) <= 0) return `Línea ${i + 1}: cantidad inválida`;
      if (!l.unidad) return `Línea ${i + 1}: unidad requerida`;
    }
    return null;
  }

  async function handleGuardar() {
    setError("");
    const err = validar();
    if (err) { setError(err); return; }

    try {
      if (esNuevo) {
        const res = await crearDocumento({ variables: { input: buildInput() } });
        const nuevoId = res.data?.crearDocumento?.id;
        if (nuevoId) navigate(`/documentos/${nuevoId}`);
      } else {
        const { tipo: _t, ...updInput } = buildInput();
        await actualizarDocumento({ variables: { id, input: updInput } });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    }
  }

  async function handleConfirmar() {
    if (!id || esNuevo) return;
    if (!confirm("¿Confirmar documento? Esta acción asigna número y genera movimientos.")) return;
    setError("");
    try {
      await confirmarDocumento({ variables: { id } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al confirmar");
    }
  }

  async function handleAnular() {
    if (!id || esNuevo) return;
    const motivo = prompt("Motivo de anulación (opcional):") ?? undefined;
    if (motivo === null) return;
    setError("");
    try {
      await anularDocumento({ variables: { id, motivo: motivo || null } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al anular");
    }
  }

  async function handleEliminar() {
    if (!id || esNuevo) return;
    if (!confirm("¿Eliminar borrador? Esta acción es irreversible.")) return;
    try {
      await eliminarDocumento({ variables: { id } });
      navigate("/documentos");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  const guardando = creando || actualizando;

  if (!esNuevo && loadingDoc && !docData) return <div style={s.page}>Cargando...</div>;

  return (
    <div style={s.page}>
      <Link to="/documentos" style={s.backLink}>← Documentos</Link>

      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            {esNuevo ? "Nuevo Documento" : numero ? `Documento ${numero}` : "Documento (borrador)"}
          </h1>
          {!esNuevo && <div style={{ marginTop: 6 }}><span style={s.badge(estadoActual)}>{estadoActual}</span></div>}
        </div>
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Cabecera</h2>
        <div style={s.grid}>
          <div style={s.field}>
            <label style={s.label}>Tipo *</label>
            <select
              style={s.select}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              disabled={!esNuevo}
            >
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Fecha *</label>
            <input type="date" style={s.input} value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={readOnly} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Almacén *</label>
            <select style={s.select} value={almacenId} onChange={(e) => setAlmacenId(e.target.value)} disabled={readOnly}>
              <option value="">— Seleccionar —</option>
              {almacenes.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          {tipo === "compra" && (
            <div style={s.field}>
              <label style={s.label}>Proveedor *</label>
              <select style={s.select} value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} disabled={readOnly}>
                <option value="">— Seleccionar —</option>
                {proveedores.map((p: any) => <option key={p.id} value={p.id}>{p.ruc} — {p.nombre}</option>)}
              </select>
            </div>
          )}

          {(tipo === "salida" || tipo === "factura") && (
            <div style={s.field}>
              <label style={s.label}>Cliente *</label>
              <select style={s.select} value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={readOnly}>
                <option value="">— Seleccionar —</option>
                {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.ruc} — {c.nombre}</option>)}
              </select>
            </div>
          )}

          {tipo === "procesamiento" && (
            <>
              <div style={s.field}>
                <label style={s.label}>Almacén destino *</label>
                <select style={s.select} value={almacenDestinoId} onChange={(e) => setAlmacenDestinoId(e.target.value)} disabled={readOnly}>
                  <option value="">— Seleccionar —</option>
                  {almacenes.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Proceso *</label>
                <select style={s.select} value={procesoId} onChange={(e) => setProcesoId(e.target.value)} disabled={readOnly}>
                  <option value="">— Seleccionar —</option>
                  {procesos.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            </>
          )}

          <div style={s.field}>
            <label style={s.label}>Conductor</label>
            <select style={s.select} value={conductorId} onChange={(e) => setConductorId(e.target.value)} disabled={readOnly}>
              <option value="">— Ninguno —</option>
              {conductores.map((c: any) => <option key={c.id} value={c.id}>{c.dni} — {c.nombres} {c.apellidos}</option>)}
            </select>
          </div>

          <div style={{ ...s.field, gridColumn: "1 / -1" }}>
            <label style={s.label}>Observaciones</label>
            <textarea style={s.textarea} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} disabled={readOnly} />
          </div>
        </div>
      </div>

      <div style={s.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <h2 style={s.sectionTitle}>Líneas</h2>
          {!readOnly && <button style={s.btnSecondary} onClick={addLinea}>+ Agregar línea</button>}
        </div>

        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>#</th>
              <th style={s.th}>Artículo</th>
              <th style={s.th}>Mov.</th>
              <th style={s.th}>Cantidad</th>
              <th style={s.th}>Unidad</th>
              <th style={s.th}>Precio</th>
              <th style={s.th}>Subtotal</th>
              {!readOnly && <th style={s.th}></th>}
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => {
              const subtotal = Number(l.cantidad || 0) * Number(l.precioUnitario || 0);
              return (
                <tr key={i}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={l.articuloId}
                      onChange={(e) => onSeleccionArticulo(i, e.target.value)}
                      disabled={readOnly}
                    >
                      <option value="">— Seleccionar —</option>
                      {articulos.map((a: any) => <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    <select
                      style={s.select}
                      value={l.movimiento}
                      onChange={(e) => updateLinea(i, { movimiento: e.target.value as Movimiento })}
                      disabled={readOnly}
                    >
                      <option value="ingreso">Ingreso</option>
                      <option value="egreso">Egreso</option>
                    </select>
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.input}
                      type="number"
                      step="0.0001"
                      min="0"
                      value={l.cantidad}
                      onChange={(e) => updateLinea(i, { cantidad: e.target.value })}
                      disabled={readOnly}
                    />
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.input}
                      value={l.unidad}
                      onChange={(e) => updateLinea(i, { unidad: e.target.value })}
                      maxLength={12}
                      disabled={readOnly}
                    />
                  </td>
                  <td style={s.td}>
                    <input
                      style={s.input}
                      type="number"
                      step="0.0001"
                      min="0"
                      value={l.precioUnitario}
                      onChange={(e) => updateLinea(i, { precioUnitario: e.target.value })}
                      disabled={readOnly}
                    />
                  </td>
                  <td style={s.td}>{subtotal.toFixed(4)}</td>
                  {!readOnly && (
                    <td style={s.td}>
                      <button style={s.btnDanger} onClick={() => removeLinea(i)} disabled={lineas.length === 1}>✕</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={s.totals}>
          <div>Subtotal: <strong>{totales.subtotal.toFixed(2)}</strong></div>
          <div>IGV (18%): <strong>{totales.igv.toFixed(2)}</strong></div>
          <div style={{ fontSize: "1.05rem", color: "#1a3a5c" }}>Total: <strong>{totales.total.toFixed(2)}</strong></div>
        </div>
      </div>

      <div style={s.toolbar}>
        <div>
          {!esNuevo && estadoActual === "borrador" && (
            <button style={s.btnDanger} onClick={handleEliminar} disabled={eliminando}>Eliminar borrador</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {!readOnly && (
            <button style={s.btnPrimary} onClick={handleGuardar} disabled={guardando}>
              {guardando ? "Guardando..." : esNuevo ? "Crear borrador" : "Guardar cambios"}
            </button>
          )}
          {!esNuevo && estadoActual === "borrador" && (
            <button style={s.btnSuccess} onClick={handleConfirmar} disabled={confirmando}>
              {confirmando ? "Confirmando..." : "Confirmar"}
            </button>
          )}
          {!esNuevo && estadoActual === "confirmado" && (
            <button style={s.btnDanger} onClick={handleAnular} disabled={anulando}>
              {anulando ? "Anulando..." : "Anular"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
