import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { usuario } = useAuth();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ color: "#1a3a5c" }}>Perunor ERP</h1>
      <p style={{ color: "#4a6580" }}>
        Bienvenido, <strong>{usuario?.nombre}</strong> ({usuario?.rol})
      </p>

      <h2 style={{ color: "#1a3a5c", fontSize: "1rem", marginTop: "2rem", marginBottom: "0.75rem" }}>
        Operaciones
      </h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Link
          to="/documentos"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#1a3a5c",
            borderRadius: 8, textDecoration: "none", color: "#fff", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Documentos
        </Link>
      </div>

      <h2 style={{ color: "#1a3a5c", fontSize: "1rem", marginTop: "2rem", marginBottom: "0.75rem" }}>
        Configuración
      </h2>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link
          to="/settings/articulos"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Artículos
        </Link>
        <Link
          to="/settings/almacenes"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Almacenes
        </Link>
        <Link
          to="/settings/procesos"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Procesos
        </Link>
        <Link
          to="/settings/proveedores"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Proveedores
        </Link>
        <Link
          to="/settings/clientes"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Clientes
        </Link>
        <Link
          to="/settings/conductores"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Conductores
        </Link>
        <Link
          to="/settings/usuarios"
          style={{
            display: "block", padding: "1rem 1.5rem", background: "#e8edf2",
            borderRadius: 8, textDecoration: "none", color: "#1a3a5c", fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Usuarios
        </Link>
      </div>
    </div>
  );
}
