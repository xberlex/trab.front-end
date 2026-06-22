import { useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { AppRoutes } from "./routes/AppRoutes";

const ROTAS_CONHECIDAS = new Set(["/", "/cadastro", "/receitas"]);

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function normalizarCaminho(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

function AuthGate() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const rotaConhecida = ROTAS_CONHECIDAS.has(normalizarCaminho(pathname));

  if (!usuario && !rotaConhecida) {
    return (
      <main className="public-error-page">
        <NotFound />
      </main>
    );
  }

  if (!usuario) return <Login />;

  return (
    <RecipeProvider key={usuario.id} usuario={usuario}>
      <div className="app-shell">
        <Header />
        <main>
          <AppRoutes />
        </main>
      </div>
    </RecipeProvider>
  );
}