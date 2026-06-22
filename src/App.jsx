import { Header } from "./components/Header";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RecipeProvider } from "./contexts/RecipeContext";
import { Login } from "./pages/Login";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { usuario } = useAuth();

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