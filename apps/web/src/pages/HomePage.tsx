import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import {
  IconDocument, IconBox, IconLedger, IconChart, IconSpark, IconPlus,
  IconChevronRight,
} from "../components/ui/Icon";

const DASHBOARD_QUERY = gql`
  query Dashboard {
    documentos(page: 1, limit: 6) {
      items { id tipo numero fecha estado total proveedor { nombre } cliente { nombre } }
      total
    }
    stockActual(page: 1, limit: 1) { total }
    articulos(page: 1, limit: 1) { total }
    almacenes(page: 1, limit: 1) { total }
  }
`;

const formatoFechaCorta = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
};

const fmtMoney = (n: string | number) => {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(v);
};

const tipoLabel: Record<string, string> = {
  compra: "Compra",
  procesamiento: "Procesamiento",
  salida: "Salida",
  factura: "Factura",
};

export function HomePage() {
  const { usuario } = useAuth();
  const { data, loading } = useQuery(DASHBOARD_QUERY);

  const docs = data?.documentos?.items ?? [];
  const stats = [
    { label: "Documentos", value: data?.documentos?.total ?? 0, icon: <IconDocument />, tone: "brand" as const, to: "/documentos" },
    { label: "SKUs activos", value: data?.articulos?.total ?? 0, icon: <IconBox />, tone: "accent" as const, to: "/settings/articulos" },
    { label: "Stock posiciones", value: data?.stockActual?.total ?? 0, icon: <IconLedger />, tone: "success" as const, to: "/inventario/stock" },
    { label: "Almacenes", value: data?.almacenes?.total ?? 0, icon: <IconChart />, tone: "warning" as const, to: "/inventario/stock" },
  ];

  const firstName = usuario?.nombre?.split(" ")[0] ?? "colega";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      {/* Hero greeting */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-xl)",
          padding: "2.25rem 2.25rem 2rem",
          background: "linear-gradient(135deg, var(--brand-800) 0%, var(--brand-700) 60%, var(--brand-600) 100%)",
          color: "#fff",
          overflow: "hidden",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 85% 10%, rgba(197, 48, 48, 0.35) 0%, transparent 50%), radial-gradient(circle at 15% 90%, rgba(194, 130, 26, 0.25) 0%, transparent 45%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, marginBottom: "0.6rem", display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
              <IconSpark size={14} /> Resumen del día
            </div>
            <h1 style={{ fontSize: "2.3rem", lineHeight: 1.05, color: "#fff", marginBottom: "0.5rem", fontWeight: 600 }}>
              {greeting}, <span style={{ fontStyle: "italic", color: "var(--ochre-100)" }}>{firstName}</span>.
            </h1>
            <p style={{ opacity: 0.82, fontSize: "0.98rem", margin: 0, lineHeight: 1.55 }}>
              Tu operación agro-industrial en una vista. Lo último en compras, kardex y procesamiento —
              sin fricción, con costos reales y trazabilidad por documento.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <Link to="/documentos/nuevo">
              <Button variant="accent" leftIcon={<IconPlus size={16} />}>Nuevo documento</Button>
            </Link>
            <Link to="/reportes/compras">
              <Button variant="ghost" style={{ color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
                Ver reportes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        {stats.map((s) => (
          <Link key={s.label} to={s.to} style={{ display: "block" }}>
            <Card
              padding="md"
              style={{
                transition: "transform var(--dur) var(--ease-smooth), box-shadow var(--dur)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <Badge tone={s.tone} dot={false}>{s.label}</Badge>
                <span style={{ color: "var(--text-subtle)", display: "flex" }}>{s.icon}</span>
              </div>
              <div className="num" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 600, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                {loading ? "—" : s.value.toLocaleString("es-PE")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: "0.6rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Ver detalle <IconChevronRight size={12} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "1.25rem" }}>
        <Card padding="md">
          <CardHeader
            title="Documentos recientes"
            subtitle="Los últimos 6 movimientos registrados en el sistema."
            actions={
              <Link to="/documentos">
                <Button size="sm" variant="ghost" rightIcon={<IconChevronRight size={14} />}>Ver todos</Button>
              </Link>
            }
          />
          {docs.length === 0 ? (
            <EmptyState
              icon={<IconDocument size={24} />}
              title="Aún no hay documentos"
              description="Crea el primer documento para iniciar la operación — compra, procesamiento, salida o factura."
              action={
                <Link to="/documentos/nuevo">
                  <Button variant="primary" leftIcon={<IconPlus size={16} />}>Crear documento</Button>
                </Link>
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              {docs.map((d: any) => (
                <Link
                  key={d.id}
                  to={`/documentos/${d.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto auto",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "0.75rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    transition: "background var(--dur)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {formatoFechaCorta(d.fecha)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>
                      {d.numero ?? <span style={{ color: "var(--text-subtle)" }}>Sin número</span>} · {tipoLabel[d.tipo] ?? d.tipo}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {d.proveedor?.nombre ?? d.cliente?.nombre ?? "Sin contraparte"}
                    </div>
                  </div>
                  <Badge tone={d.estado as any}>{d.estado}</Badge>
                  <div className="num" style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", minWidth: 110, textAlign: "right" }}>
                    {fmtMoney(d.total)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card padding="md" tone="sunken">
          <CardHeader title="Atajos" subtitle="Las tareas que más hacés." />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { to: "/documentos/nuevo", label: "Nueva compra", desc: "Ingreso de materia prima", icon: <IconDocument /> },
              { to: "/inventario/kardex", label: "Revisar kardex", desc: "Historial por artículo", icon: <IconLedger /> },
              { to: "/reportes/compras", label: "Reporte de compras", desc: "Exportar CSV por período", icon: <IconChart /> },
              { to: "/inventario/stock", label: "Stock actual", desc: "Posiciones por almacén", icon: <IconBox /> },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.7rem 0.85rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  transition: "border-color var(--dur), transform var(--dur)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-500)"; e.currentTarget.style.transform = "translateX(2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--brand-50)", color: "var(--brand-700)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{a.label}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{a.desc}</div>
                </div>
                <IconChevronRight size={14} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
