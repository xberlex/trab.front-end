import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { NotFound } from "../pages/NotFound";

const Home = lazy(() => import("../pages/Home").then((module) => ({ default: module.Home })));
const Cadastro = lazy(() => import("../pages/Cadastro").then((module) => ({ default: module.Cadastro })));
const Listagem = lazy(() => import("../pages/Listagem").then((module) => ({ default: module.Listagem })));

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/receitas" element={<Listagem />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoader() {
  return (
    <section className="route-loader" aria-live="polite">
      <strong>Abrindo o bau...</strong>
    </section>
  );
}