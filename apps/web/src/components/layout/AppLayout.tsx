import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { IconMenu } from "../ui/Icon";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarW = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <button
        aria-label="Abrir menú"
        onClick={() => setMobileOpen(true)}
        className="mobile-menu-btn"
        style={{
          position: "fixed", top: 14, left: 14, zIndex: 30,
          width: 40, height: 40, borderRadius: "var(--radius-md)",
          background: "var(--surface)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--shadow-sm)",
          color: "var(--text)",
        }}
      >
        <IconMenu size={20} />
      </button>

      <main
        className="app-main"
        style={{
          paddingLeft: sidebarW,
          transition: "padding-left var(--dur) var(--ease-smooth)",
          animation: "fadeIn var(--dur-slow) var(--ease-smooth)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--content-max)",
            margin: "0 auto",
            padding: "1.5rem 1.75rem 3rem",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
