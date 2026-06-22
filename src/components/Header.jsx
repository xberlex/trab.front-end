import { ClipboardList, Home as HomeIcon, LogOut, PlusCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { APP_NAME } from "../config/app";
import { useAuth } from "../contexts/AuthContext";

export function Header() {
  const { usuario, sair } = useAuth();

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <span>
          <strong>{APP_NAME}</strong>
          <small>Receitas guardadas a chave</small>
        </span>
      </NavLink>

      <nav className="nav-links" aria-label="Principal">
        <NavLink to="/">
          <HomeIcon size={18} />
          Home
        </NavLink>
        <NavLink to="/cadastro">
          <PlusCircle size={18} />
          Cadastro
        </NavLink>
        <NavLink to="/receitas">
          <ClipboardList size={18} />
          Listagem
        </NavLink>
      </nav>

      <div className="user-area">
        <span>
          <User size={16} />
          {usuario.nome}
        </span>
        <button className="logout-button" onClick={sair}>
          <LogOut size={17} />
          Sair
        </button>
      </div>
    </header>
  );
}