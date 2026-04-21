import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import {
  IconDashboard, IconDocument, IconBox, IconLedger,
  IconChart, IconCircleDot, IconTag, IconBuilding,
  IconWorkflow, IconTruck, IconUser, IconUsers, IconWarehouse,
} from "../ui/Icon";

interface NavItem { to: string; label: string; icon: ReactNode; end?: boolean }
interface NavSection { section: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    section: "General",
    items: [{ to: "/", label: "Dashboard", icon: <IconDashboard />, end: true }],
  },
  {
    section: "Operaciones",
    items: [
      { to: "/documentos", label: "Documentos", icon: <IconDocument /> },
      { to: "/inventario/stock", label: "Stock", icon: <IconBox /> },
      { to: "/inventario/kardex", label: "Kardex", icon: <IconLedger /> },
    ],
  },
  {
    section: "Reportes",
    items: [
      { to: "/reportes/compras", label: "Compras", icon: <IconChart /> },
      { to: "/reportes/movimientos", label: "Movimientos", icon: <IconCircleDot /> },
    ],
  },
  {
    section: "Catálogo",
    items: [
      { to: "/settings/articulos", label: "Artículos", icon: <IconTag /> },
      { to: "/settings/almacenes", label: "Almacenes", icon: <IconWarehouse /> },
      { to: "/settings/procesos", label: "Procesos", icon: <IconWorkflow /> },
    ],
  },
  {
    section: "Terceros",
    items: [
      { to: "/settings/proveedores", label: "Proveedores", icon: <IconBuilding /> },
      { to: "/settings/clientes", label: "Clientes", icon: <IconUser /> },
      { to: "/settings/conductores", label: "Conductores", icon: <IconTruck /> },
      { to: "/settings/usuarios", label: "Usuarios", icon: <IconUsers /> },
    ],
  },
];

export function Sidebar() {
  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        minWidth: "var(--sidebar-w)",
        background: "var(--brand-800)",
        color: "var(--text-inverse)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Brand mark */}
      <div style={{ padding: "1.35rem 1.25rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, var(--accent) 0%, var(--paprika-700) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem",
              boxShadow: "0 6px 16px rgba(197, 48, 48, 0.4)",
            }}
          >P</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
              Perunor
            </div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              ERP · Agro
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "1rem 0.75rem 1.5rem" }}>
        {sections.map((section) => (
          <div key={section.section} style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.42)",
                fontWeight: 700,
                padding: "0.35rem 0.9rem 0.5rem",
              }}
            >
              {section.section}
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      padding: "0.55rem 0.9rem",
                      borderRadius: "var(--radius-md)",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                      fontSize: "0.88rem",
                      fontWeight: isActive ? 600 : 500,
                      transition: "background var(--dur), color var(--dur)",
                      position: "relative",
                    })}
                    onMouseEnter={(e) => { if (!e.currentTarget.getAttribute("aria-current")) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { if (!e.currentTarget.getAttribute("aria-current")) e.currentTarget.style.background = "transparent"; }}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            aria-hidden
                            style={{
                              position: "absolute",
                              left: -6,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 3,
                              height: 20,
                              background: "var(--accent)",
                              borderRadius: 2,
                            }}
                          />
                        )}
                        <span style={{ color: isActive ? "var(--accent)" : "rgba(255,255,255,0.55)", display: "flex" }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "0.9rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>
        v0.1 · single-tenant
      </div>
    </aside>
  );
}
