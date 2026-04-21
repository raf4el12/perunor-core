import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { KpiCard } from "../components/ui/KpiCard";
import { ModuleCard } from "../components/ui/ModuleCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  IconDollar, IconFactory, IconTruck, IconFileCheck,
  IconCart, IconBox, IconChart, IconSettings, IconDocument,
  IconAlert, IconArrowRight,
} from "../components/ui/Icon";

const DASHBOARD_QUERY = gql`
  query Dashboard {
    documentos(page: 1, limit: 5) {
      items { id tipo numero fecha estado total proveedor { nombre } cliente { nombre } }
      total
    }
    stockActual(page: 1, limit: 1) { total }
    articulos(page: 1, limit: 1) { total }
    almacenes(page: 1, limit: 1) { total }
  }
`;

const tipoLabel: Record<string, string> = {
  compra: "Compra",
  procesamiento: "Procesamiento",
  salida: "Salida",
  factura: "Factura",
};

const fmtMoney = (n: string | number) => {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(v);
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });

const estadoTone: Record<string, "borrador" | "confirmado" | "anulado"> = {
  borrador: "borrador", confirmado: "confirmado", anulado: "anulado",
};

export function HomePage() {
  const { usuario } = useAuth();
  const { data, loading } = useQuery(DASHBOARD_QUERY);

  const docs = data?.documentos?.items ?? [];
  const totalDocs = data?.documentos?.total ?? 0;
  const totalSkus = data?.articulos?.total ?? 0;
  const totalStock = data?.stockActual?.total ?? 0;
  const totalAlmacenes = data?.almacenes?.total ?? 0;

  const firstName = usuario?.nombre?.split(" ")[0] ?? "colega";

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>
          Bienvenido, {firstName}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", margin: 0 }}>
          Resumen de operaciones y acceso rápido a módulos.
        </p>
      </div>

      {/* KPIs */}
      <section style={{ marginBottom: "2rem" }}>
        <SectionHeader>Indicadores del día</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <KpiCard
            title="Documentos"
            value={loading ? "—" : totalDocs.toLocaleString("es-PE")}
            subtitle="Total histórico"
            icon={<IconDollar size={22} />}
            variant="success"
          />
          <KpiCard
            title="SKUs activos"
            value={loading ? "—" : totalSkus.toLocaleString("es-PE")}
            subtitle="Artículos en catálogo"
            icon={<IconFactory size={22} />}
            variant="info"
          />
          <KpiCard
            title="Stock posiciones"
            value={loading ? "—" : totalStock.toLocaleString("es-PE")}
            subtitle="Artículo × almacén con saldo"
            icon={<IconTruck size={22} />}
            variant="default"
          />
          <KpiCard
            title="Almacenes"
            value={loading ? "—" : totalAlmacenes.toLocaleString("es-PE")}
            subtitle="Puntos de inventario"
            icon={<IconFileCheck size={22} />}
            variant="warning"
          />
        </div>
      </section>

      {/* Module cards */}
      <section style={{ marginBottom: "2rem" }}>
        <SectionHeader>Acceso rápido</SectionHeader>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <ModuleCard
            title="Compras"
            description="Registrar ingresos de materia prima de proveedores"
            to="/documentos?tipo=compra"
            icon={<IconCart size={20} />}
            color="primary"
          />
          <ModuleCard
            title="Procesamiento"
            description="Control de transformación y secado de paprika"
            to="/documentos?tipo=procesamiento"
            icon={<IconFactory size={20} />}
            color="blue"
          />
          <ModuleCard
            title="Salidas"
            description="Gestionar despachos y salidas de producto"
            to="/documentos?tipo=salida"
            icon={<IconTruck size={20} />}
            color="amber"
          />
          <ModuleCard
            title="Inventario"
            description="Consultar stock actual por almacén y artículo"
            to="/inventario/stock"
            icon={<IconBox size={20} />}
            color="red"
          />
          <ModuleCard
            title="Reportes"
            description="Generar informes de operaciones y análisis"
            to="/reportes/compras"
            icon={<IconChart size={20} />}
            color="emerald"
          />
          <ModuleCard
            title="Configuración"
            description="Administrar artículos, almacenes y proveedores"
            to="/settings/articulos"
            icon={<IconSettings size={20} />}
            color="slate"
          />
        </div>
      </section>

      {/* Stock alerts + recent documents */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "1.25rem" }}>
        <StockAlertsCard />
        <RecentDocumentsCard docs={docs} loading={loading} />
      </div>
    </>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "0.78rem", fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: "0.85rem",
        fontFamily: "var(--font-body)",
      }}
    >
      {children}
    </h2>
  );
}

function StockAlertsCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1rem 1.1rem 0.85rem", display: "flex", alignItems: "center", gap: "0.55rem", borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--ochre-500)", display: "flex" }}>
          <IconAlert size={18} />
        </span>
        <h3 style={{ fontSize: "0.95rem", margin: 0, fontWeight: 700, fontFamily: "var(--font-body)", letterSpacing: "-0.01em" }}>
          Alertas de stock
        </h3>
      </div>
      <div style={{ padding: "2rem 1.1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        No hay alertas de stock crítico.
        <div style={{ fontSize: "0.75rem", marginTop: "0.35rem", color: "var(--text-subtle)" }}>
          Configura un mínimo por artículo para activar alertas.
        </div>
      </div>
    </div>
  );
}

function RecentDocumentsCard({ docs, loading }: { docs: any[]; loading: boolean }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1rem 1.1rem 0.85rem", display: "flex", alignItems: "center", gap: "0.55rem", borderBottom: "1px solid var(--border)" }}>
        <span style={{ color: "var(--text-muted)", display: "flex" }}>
          <IconDocument size={18} />
        </span>
        <h3 style={{ fontSize: "0.95rem", margin: 0, fontWeight: 700, fontFamily: "var(--font-body)", letterSpacing: "-0.01em", flex: 1 }}>
          Últimos documentos
        </h3>
        <Link to="/documentos">
          <Button size="sm" variant="ghost" rightIcon={<IconArrowRight size={14} />}>Ver todos</Button>
        </Link>
      </div>

      {loading && docs.length === 0 ? (
        <div style={{ padding: "2rem 1.1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Cargando…
        </div>
      ) : docs.length === 0 ? (
        <div style={{ padding: "2rem 1.1rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Aún no hay documentos registrados.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--surface-alt)" }}>
              <th style={thStyle}>Documento</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Fecha</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: "right", paddingRight: "1.1rem" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ ...tdStyle, paddingLeft: "1.1rem" }}>
                  <Link to={`/documentos/${d.id}`} style={{ color: "var(--brand-700)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.82rem" }}>
                    {d.numero ?? <span style={{ color: "var(--text-subtle)" }}>s/n</span>}
                  </Link>
                  <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {d.proveedor?.nombre ?? d.cliente?.nombre ?? "—"}
                  </div>
                </td>
                <td style={{ ...tdStyle, color: "var(--text-muted)" }}>{tipoLabel[d.tipo] ?? d.tipo}</td>
                <td style={{ ...tdStyle, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{fmtDate(d.fecha)}</td>
                <td style={tdStyle}>
                  <Badge tone={estadoTone[d.estado] ?? "neutral"}>{d.estado}</Badge>
                </td>
                <td style={{ ...tdStyle, textAlign: "right", paddingRight: "1.1rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  {fmtMoney(d.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.55rem 0.75rem",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.65rem 0.75rem",
  color: "var(--text)",
  verticalAlign: "middle",
};
