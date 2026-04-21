import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select, Field } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { IconPlus, IconSearch, IconTag } from "../../components/ui/Icon";

const ARTICULOS_QUERY = gql`
  query Articulos($page: Int, $limit: Int, $search: String) {
    articulos(page: $page, limit: $limit, search: $search) {
      items { id codigo nombre descripcion unidadMedida categoria activo }
      total page limit
    }
  }
`;

const CREAR_ARTICULO = gql`
  mutation CrearArticulo($input: CrearArticuloInput!) {
    crearArticulo(input: $input) { id }
  }
`;

const ACTUALIZAR_ARTICULO = gql`
  mutation ActualizarArticulo($id: ID!, $input: ActualizarArticuloInput!) {
    actualizarArticulo(id: $id, input: $input) { id }
  }
`;

const TOGGLE_ARTICULO = gql`
  mutation ToggleArticulo($id: ID!) {
    toggleArticulo(id: $id) { id activo }
  }
`;

const CATEGORIAS: Record<string, string> = {
  materia_prima: "Materia Prima",
  insumo: "Insumo",
  producto_terminado: "Producto Terminado",
  empaque: "Empaque",
};

const UNIDADES = ["kg", "tn", "saco", "caja", "unidad", "litro", "g", "m"];
const LIMIT = 10;

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
  codigo: "", nombre: "", descripcion: "", unidadMedida: "kg", categoria: "materia_prima",
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
    setEditandoId(null); setForm(FORM_VACIO); setFormError(""); setModalOpen(true);
  }
  function abrirEditar(art: Articulo) {
    setEditandoId(art.id);
    setForm({
      codigo: art.codigo, nombre: art.nombre, descripcion: art.descripcion ?? "",
      unidadMedida: art.unidadMedida, categoria: art.categoria,
    });
    setFormError(""); setModalOpen(true);
  }
  function cerrarModal() { setModalOpen(false); setEditandoId(null); setForm(FORM_VACIO); setFormError(""); }
  function setField(key: keyof FormState, value: string) { setForm((p) => ({ ...p, [key]: value })); }

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
      if (editandoId) await actualizarArticulo({ variables: { id: editandoId, input } });
      else await crearArticulo({ variables: { input } });
      cerrarModal();
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
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

  const columns: Column<Articulo>[] = [
    {
      key: "codigo", header: "Código", width: 140,
      render: (a) => <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--brand-700)" }}>{a.codigo}</span>,
    },
    {
      key: "nombre", header: "Nombre",
      render: (a) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)" }}>{a.nombre}</div>
          {a.descripcion && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{a.descripcion}</div>}
        </div>
      ),
    },
    {
      key: "categoria", header: "Categoría", width: 170,
      render: (a) => <Badge tone="neutral">{CATEGORIAS[a.categoria] ?? a.categoria}</Badge>,
    },
    {
      key: "unidad", header: "Unidad", width: 90, align: "center",
      render: (a) => <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-muted)" }}>{a.unidadMedida}</span>,
    },
    {
      key: "estado", header: "Estado", width: 110,
      render: (a) => <Badge tone={a.activo ? "success" : "danger"} dot>{a.activo ? "Activo" : "Inactivo"}</Badge>,
    },
    {
      key: "acciones", header: "", align: "right", width: 220,
      render: (a) => (
        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); abrirEditar(a); }}>Editar</Button>
          <Button
            size="sm"
            variant={a.activo ? "danger" : "secondary"}
            onClick={(e) => { e.stopPropagation(); handleToggle(a.id); }}
          >
            {a.activo ? "Desactivar" : "Activar"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Artículos"
        subtitle="Gestiona el maestro de SKUs: materia prima, insumos, productos terminados y empaques."
        breadcrumbs={[{ label: "Inicio", href: "/" }, { label: "Artículos" }]}
        actions={
          <Button variant="primary" leftIcon={<IconPlus size={16} />} onClick={abrirCrear}>
            Nuevo artículo
          </Button>
        }
      />

      <Card padding="md" style={{ marginBottom: "1rem" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Buscar por código o nombre…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<IconSearch size={16} />}
            />
          </div>
          <Button type="submit" variant="primary">Buscar</Button>
          {search && (
            <Button type="button" variant="ghost" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}>
              Limpiar
            </Button>
          )}
        </form>
      </Card>

      <DataTable
        columns={columns}
        rows={articulos}
        keyExtractor={(a) => a.id}
        loading={loading && articulos.length === 0}
        empty={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1rem" }}>
            <IconTag size={28} />
            <div style={{ fontWeight: 600, color: "var(--text)" }}>
              {search ? `Sin resultados para "${search}"` : "Aún no hay artículos"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {search ? "Prueba con otra búsqueda." : "Crea el primer artículo para arrancar el catálogo."}
            </div>
          </div>
        }
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
        <span>{total} artículo{total !== 1 ? "s" : ""}</span>
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹ Anterior</Button>
            <span style={{ fontFamily: "var(--font-mono)" }}>Página {page} de {totalPages}</span>
            <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</Button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(28, 25, 23, 0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem",
            animation: "fadeIn var(--dur) var(--ease-smooth)",
          }}
          onClick={(e) => e.target === e.currentTarget && cerrarModal()}
        >
          <Card padding="lg" style={{ width: "100%", maxWidth: 520, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                {editandoId ? "Editar" : "Nuevo"}
              </div>
              <h2 style={{ fontSize: "1.4rem", margin: 0 }}>
                {editandoId ? "Editar artículo" : "Nuevo artículo"}
              </h2>
            </div>

            {formError && (
              <div style={{ padding: "0.65rem 0.85rem", background: "var(--danger-subtle)", color: "var(--danger)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Field label="Código" required>
                <Input
                  value={form.codigo}
                  onChange={(e) => setField("codigo", e.target.value)}
                  placeholder="Ej: ART-001"
                  maxLength={50}
                  required
                />
              </Field>

              <Field label="Nombre" required>
                <Input
                  value={form.nombre}
                  onChange={(e) => setField("nombre", e.target.value)}
                  placeholder="Nombre del artículo"
                  maxLength={200}
                  required
                />
              </Field>

              <Field label="Descripción" helper="Opcional — detalle adicional del SKU.">
                <Input
                  value={form.descripcion}
                  onChange={(e) => setField("descripcion", e.target.value)}
                  placeholder="Descripción opcional"
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Unidad de medida" required>
                  <Select
                    value={UNIDADES.includes(form.unidadMedida) ? form.unidadMedida : "__custom"}
                    onChange={(e) => { if (e.target.value !== "__custom") setField("unidadMedida", e.target.value); }}
                  >
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                    {!UNIDADES.includes(form.unidadMedida) && (
                      <option value="__custom">{form.unidadMedida} (personalizado)</option>
                    )}
                  </Select>
                  <div style={{ marginTop: "0.4rem" }}>
                    <Input
                      value={form.unidadMedida}
                      onChange={(e) => setField("unidadMedida", e.target.value)}
                      placeholder="O escribe otra"
                      maxLength={20}
                    />
                  </div>
                </Field>

                <Field label="Categoría" required>
                  <Select
                    value={form.categoria}
                    onChange={(e) => setField("categoria", e.target.value)}
                  >
                    {Object.entries(CATEGORIAS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <Button type="button" variant="ghost" onClick={cerrarModal}>Cancelar</Button>
                <Button type="submit" variant="primary" loading={guardando}>
                  {editandoId ? "Guardar cambios" : "Crear artículo"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
