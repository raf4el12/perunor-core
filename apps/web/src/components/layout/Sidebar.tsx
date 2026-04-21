import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import { useAuth } from "../../hooks/useAuth";
import {
  IconDashboard, IconDocument, IconBox, IconChart, IconSettings,
  IconChevronLeft, IconBell, IconLogout, IconUser, IconCart, IconFactory, IconTruck,
} from "../ui/Icon";
import type { ReactNode } from "react";
import avatarSidebar from "../../images/avatarSidebar.jpg";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
  subItems?: { label: string; to: string; icon?: ReactNode }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", end: true, icon: <IconDashboard /> },
  {
    label: "Documentos", to: "/documentos", icon: <IconDocument />,
    subItems: [
      { label: "Compras", to: "/documentos?tipo=compra", icon: <IconCart size={14} /> },
      { label: "Procesamiento", to: "/documentos?tipo=procesamiento", icon: <IconFactory size={14} /> },
      { label: "Salidas", to: "/documentos?tipo=salida", icon: <IconTruck size={14} /> },
    ],
  },
  { label: "Inventario", to: "/inventario/stock", icon: <IconBox /> },
  { label: "Reportes", to: "/reportes/compras", icon: <IconChart /> },
  {
    label: "Configuración", to: "/settings/articulos", icon: <IconSettings />,
    subItems: [
      { label: "Artículos", to: "/settings/articulos" },
      { label: "Almacenes", to: "/settings/almacenes" },
      { label: "Procesos", to: "/settings/procesos" },
      { label: "Proveedores", to: "/settings/proveedores" },
      { label: "Clientes", to: "/settings/clientes" },
      { label: "Conductores", to: "/settings/conductores" },
      { label: "Usuarios", to: "/settings/usuarios" },
    ],
  },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  notificationCount?: number;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, notificationCount = 0 }: SidebarProps) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const apollo = useApolloClient();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function logout() {
    localStorage.removeItem("token");
    await apollo.resetStore();
    navigate("/login", { replace: true });
  }

  const isItemActive = (item: NavItem) => {
    const path = item.to.split("?")[0];
    if (item.end) return location.pathname === path;
    if (path === "/documentos") return location.pathname.startsWith("/documentos");
    if (path === "/inventario/stock") return location.pathname.startsWith("/inventario");
    if (path === "/reportes/compras") return location.pathname.startsWith("/reportes");
    if (path === "/settings/articulos") return location.pathname.startsWith("/settings");
    return location.pathname === path;
  };

  const width = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(20, 41, 26, 0.5)",
            backdropFilter: "blur(3px)", zIndex: 40,
          }}
          className="sidebar-mobile-overlay"
        />
      )}

      <aside
        className={`app-sidebar ${mobileOpen ? "is-mobile-open" : ""}`}
        style={{
          position: "fixed",
          inset: "0 auto 0 0",
          width,
          background: "var(--brand-800)",
          color: "var(--text-inverse)",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--brand-900)",
          zIndex: 50,
          transition: "width var(--dur) var(--ease-smooth), transform var(--dur) var(--ease-smooth)",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "0 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--brand-500)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                flexShrink: 0,
              }}
            >P</div>
            {!collapsed && (
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>
                Paprika ERP
              </span>
            )}
          </NavLink>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expandir" : "Colapsar"}
            style={{
              position: collapsed ? "absolute" : "static",
              right: collapsed ? -12 : undefined,
              top: collapsed ? 22 : undefined,
              width: collapsed ? 24 : 28,
              height: collapsed ? 24 : 28,
              border: collapsed ? "1px solid var(--brand-900)" : "none",
              borderRadius: collapsed ? "50%" : "var(--radius-sm)",
              background: collapsed ? "var(--brand-800)" : "transparent",
              color: "rgba(255,255,255,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background var(--dur), color var(--dur)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-700)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = collapsed ? "var(--brand-800)" : "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            <IconChevronLeft size={14} style={{ transform: collapsed ? "rotate(180deg)" : undefined, transition: "transform var(--dur)" }} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0.55rem" }}>
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <div key={item.to} style={{ marginBottom: 2 }}>
                <NavLink
                  to={item.to}
                  onClick={onMobileClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: collapsed ? "0.65rem" : "0.6rem 0.8rem",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "var(--radius-md)",
                    color: active ? "#fff" : "rgba(255,255,255,0.72)",
                    background: active ? "var(--brand-500)" : "transparent",
                    fontSize: "0.88rem",
                    fontWeight: active ? 600 : 500,
                    boxShadow: active ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
                    transition: "background var(--dur), color var(--dur)",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--brand-700)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                </NavLink>

                {!collapsed && item.subItems && active && (
                  <div style={{ marginLeft: "1rem", marginTop: 2, paddingLeft: "0.75rem", borderLeft: "1px solid rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", gap: 1 }}>
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.to}
                        to={sub.to}
                        onClick={onMobileClose}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.5rem",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.62)",
                          borderRadius: "var(--radius-sm)",
                          transition: "background var(--dur), color var(--dur)",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-700)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.62)"; }}
                      >
                        {sub.icon && <span style={{ display: "flex" }}>{sub.icon}</span>}
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "0.75rem" }}>
          <button
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "100%",
              padding: collapsed ? "0.55rem" : "0.55rem 0.75rem",
              justifyContent: collapsed ? "center" : "flex-start",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.85rem",
              transition: "background var(--dur), color var(--dur)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--brand-700)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            <IconBell size={18} />
            {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>Notificaciones</span>}
            {notificationCount > 0 && (
              <span style={{
                position: collapsed ? "absolute" : "static",
                top: collapsed ? 4 : undefined,
                right: collapsed ? 4 : undefined,
                minWidth: 18, height: 18, padding: "0 5px",
                background: "var(--danger)", color: "#fff",
                borderRadius: "var(--radius-full)",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <div ref={userMenuRef} style={{ position: "relative", marginTop: 2 }}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                width: "100%",
                padding: collapsed ? "0.4rem" : "0.45rem 0.6rem",
                justifyContent: collapsed ? "center" : "flex-start",
                background: userMenuOpen ? "var(--brand-700)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "rgba(255,255,255,0.9)",
                transition: "background var(--dur)",
              }}
              onMouseEnter={(e) => { if (!userMenuOpen) e.currentTarget.style.background = "var(--brand-700)"; }}
              onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.background = "transparent"; }}
            >
              <img
                src={avatarSidebar}
                alt={usuario?.nombre ?? "Usuario"}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  objectFit: "cover",
                  background: "rgba(255,255,255,0.12)",
                  flexShrink: 0,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.15)",
                }}
              />
              {!collapsed && (
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>
                    {usuario?.nombre ?? "Usuario"}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {usuario?.rol}
                  </div>
                </div>
              )}
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 6px)",
                  left: 0, right: 0,
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "0.4rem",
                  animation: "fadeIn var(--dur) var(--ease-smooth)",
                  minWidth: 200,
                }}
              >
                <div style={{ padding: "0.5rem 0.65rem", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{usuario?.nombre}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{usuario?.email}</div>
                </div>
                <MenuItem icon={<IconUser size={14} />} label="Mi perfil" />
                <MenuItem icon={<IconSettings size={14} />} label="Configuración" />
                <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                <MenuItem icon={<IconLogout size={14} />} label="Cerrar sesión" destructive onClick={logout} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function MenuItem({ icon, label, destructive, onClick }: { icon: ReactNode; label: string; destructive?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.55rem",
        width: "100%", padding: "0.5rem 0.65rem",
        background: "transparent", border: "none",
        borderRadius: "var(--radius-sm)",
        color: destructive ? "var(--danger)" : "var(--text)",
        fontSize: "0.85rem", fontWeight: 500,
        textAlign: "left",
        transition: "background var(--dur)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = destructive ? "var(--danger-subtle)" : "var(--surface-alt)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ display: "flex", color: destructive ? "var(--danger)" : "var(--text-muted)" }}>{icon}</span>
      {label}
    </button>
  );
}
