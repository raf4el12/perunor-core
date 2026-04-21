import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApolloClient } from "@apollo/client";
import { useAuth } from "../../hooks/useAuth";
import { IconLogout, IconSearch, IconChevronDown } from "../ui/Icon";

export function Topbar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const apollo = useApolloClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    localStorage.removeItem("token");
    await apollo.resetStore();
    navigate("/login", { replace: true });
  }

  const initials = (usuario?.nombre ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <header
      style={{
        height: "var(--topbar-h)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.75rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "saturate(180%) blur(8px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
          {today}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "var(--surface-alt)",
            padding: "0.45rem 0.75rem",
            borderRadius: "var(--radius-md)",
            minWidth: 280,
            color: "var(--text-subtle)",
            fontSize: "0.85rem",
          }}
        >
          <IconSearch size={16} />
          <span>Busca artículos, documentos, proveedores…</span>
          <span style={{ marginLeft: "auto", fontSize: "0.7rem", fontFamily: "var(--font-mono)", padding: "0.1rem 0.35rem", borderRadius: 4, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            ⌘K
          </span>
        </div>

        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              padding: "0.35rem 0.65rem 0.35rem 0.4rem",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              transition: "background var(--dur)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand-700), var(--accent))",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "0.8rem",
              }}
            >{initials}</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
              {usuario?.nombre?.split(" ")[0] ?? "Usuario"}
            </span>
            <IconChevronDown size={14} />
          </button>
          {open && (
            <div
              style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                minWidth: 220,
                padding: "0.4rem",
                zIndex: 20,
                animation: "fadeIn var(--dur) var(--ease-smooth)",
              }}
            >
              <div style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{usuario?.nombre}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                  {usuario?.rol}
                </div>
              </div>
              <button
                onClick={logout}
                style={{
                  display: "flex", alignItems: "center", gap: "0.55rem",
                  width: "100%", padding: "0.55rem 0.75rem", border: "none",
                  background: "transparent", borderRadius: "var(--radius-sm)",
                  color: "var(--danger)", fontSize: "0.85rem", fontWeight: 500,
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <IconLogout size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
