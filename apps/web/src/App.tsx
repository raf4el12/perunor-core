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
import { DocumentosPage } from "./pages/documentos/DocumentosPage";
import { DocumentoEditorPage } from "./pages/documentos/DocumentoEditorPage";
import { KardexPage } from "./pages/inventario/KardexPage";
import { StockPage } from "./pages/inventario/StockPage";
import { ReporteComprasPage } from "./pages/reportes/ReporteComprasPage";
import { ReporteMovimientosPage } from "./pages/reportes/ReporteMovimientosPage";
import { AppLayout } from "./components/layout/AppLayout";
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
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings/articulos" element={<ArticulosPage />} />
        <Route path="/settings/almacenes" element={<AlmacenesPage />} />
        <Route path="/settings/procesos" element={<ProcesosPage />} />
        <Route path="/settings/proveedores" element={<ProveedoresPage />} />
        <Route path="/settings/clientes" element={<ClientesPage />} />
        <Route path="/settings/conductores" element={<ConductoresPage />} />
        <Route path="/settings/usuarios" element={<UsuariosPage />} />
        <Route path="/documentos" element={<DocumentosPage />} />
        <Route path="/documentos/nuevo" element={<DocumentoEditorPage />} />
        <Route path="/documentos/:id" element={<DocumentoEditorPage />} />
        <Route path="/inventario/stock" element={<StockPage />} />
        <Route path="/inventario/kardex" element={<KardexPage />} />
        <Route path="/reportes/compras" element={<ReporteComprasPage />} />
        <Route path="/reportes/movimientos" element={<ReporteMovimientosPage />} />
        <Route path="/*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
