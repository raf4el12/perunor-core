import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { ArticulosPage } from "./pages/settings/ArticulosPage";
import { AlmacenesPage } from "./pages/settings/AlmacenesPage";
import { ProcesosPage } from "./pages/settings/ProcesosPage";
import { ProveedoresPage } from "./pages/settings/ProveedoresPage";
import { ClientesPage } from "./pages/settings/ClientesPage";
import { ConductoresPage } from "./pages/settings/ConductoresPage";
import { UsuariosPage } from "./pages/settings/UsuariosPage";
import { useAuth } from "./hooks/useAuth";

export function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings/articulos" element={<ArticulosPage />} />
      <Route path="/settings/almacenes" element={<AlmacenesPage />} />
      <Route path="/settings/procesos" element={<ProcesosPage />} />
      <Route path="/settings/proveedores" element={<ProveedoresPage />} />
      <Route path="/settings/clientes" element={<ClientesPage />} />
      <Route path="/settings/conductores" element={<ConductoresPage />} />
      <Route path="/settings/usuarios" element={<UsuariosPage />} />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
