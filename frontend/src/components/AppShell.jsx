//Leonardo Stuani Godoi
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, Receipt, Wallet, Package, Users, User,
  Sun, Moon, LogOut, UserCircle,
} from "lucide-react";
import { StuaniLogo } from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { ehDoGrupo } from "../utils/grupos";

const BREADCRUMBS = {
  "/home": "dashboard / hoje",
  "/comandas": "comandas / abertas",
  "/caixa": "caixa",
  "/produtos": "produtos / cardápio",
  "/clientes": "clientes / ativos",
  "/funcionarios": "equipe / funcionários",
  "/perfil": "perfil / minha conta",
};

const DOCK_MAP = {
  "/home": "home",
  "/comandas": "comandas",
  "/comanda": "comandas",
  "/caixa": "caixa",
  "/produtos": "produtos",
  "/produto": "produtos",
  "/clientes": "clientes",
  "/cliente": "clientes",
  "/funcionarios": "equipe",
  "/funcionario": "equipe",
  "/perfil": "equipe",
};

// allowedGroups (opcional): só mostra o item se o grupo do usuário estiver na lista
const dockItems = [
  { id: "home",     label: "Início",   Icon: Home,       path: "/home" },
  { id: "comandas", label: "Comandas", Icon: Receipt,    path: "/comandas" },
  { id: "caixa",    label: "Caixa",    Icon: Wallet,     path: "/caixa",        allowedGroups: [1, 3] },
  { id: "produtos", label: "Produtos", Icon: Package,    path: "/produtos" },
  { id: "clientes", label: "Clientes", Icon: Users,      path: "/clientes" },
  { id: "equipe",   label: "Equipe",   Icon: User,       path: "/funcionarios", allowedGroups: [1] },
];

const AvatarMenu = () => {
  const { getIniciais, usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className="avatar"
        style={{ width: 38, height: 38, fontSize: 11, cursor: "pointer", overflow: "hidden", padding: 0 }}
        onClick={() => setOpen((v) => !v)}
        title={usuario?.nome}
      >
        {!imgError ? (
          <img
            src="/user-face.png"
            alt={usuario?.nome}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }}
            onError={() => setImgError(true)}
          />
        ) : (
          getIniciais()
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          minWidth: 200,
          zIndex: 50,
          overflow: "hidden",
        }}>
          {/* User info */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{usuario?.nome}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{usuario?.grupoLabel || "—"}</div>
          </div>
          {/* Actions */}
          <div style={{ padding: 6 }}>
            <button
              onClick={() => { setOpen(false); navigate("/perfil"); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: "var(--radius-sm)",
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--ink)", fontFamily: "inherit",
                fontWeight: 500, textAlign: "left",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <UserCircle size={15} style={{ color: "var(--ink-3)" }} />
              Meu perfil
            </button>
            <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
            <button
              onClick={() => { setOpen(false); logout(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: "var(--radius-sm)",
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--bad)", fontFamily: "inherit",
                fontWeight: 500, textAlign: "left",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bad-soft)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Topbar = ({ breadcrumb }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="topbar">
      <StuaniLogo size="md" dark={isDark} />
      <div className="topbar-divider" />
      {breadcrumb && (
        <span className="topbar-breadcrumb" style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "JetBrains Mono, monospace" }}>
          {breadcrumb}
        </span>
      )}
      <button
        className="btn-icon"
        style={{ marginLeft: "auto" }}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title="Alternar tema"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <AvatarMenu />
    </header>
  );
};

const Dock = ({ active }) => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const visiveis = dockItems.filter(
    (item) => !item.allowedGroups || ehDoGrupo(usuario, item.allowedGroups),
  );
  return (
    <nav className="dock">
      {visiveis.map(({ id, label, Icon, path, badge }) => (
        <div
          key={id}
          className={"dock-item" + (active === id ? " active" : "")}
          onClick={() => navigate(path)}
        >
          <Icon size={20} />
          <span className="dock-label">{label}</span>
          {badge && <span className="dock-badge">{badge}</span>}
        </div>
      ))}
    </nav>
  );
};

const AppShell = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const pathname = location.pathname;
  const breadcrumb = Object.entries(BREADCRUMBS).find(([key]) =>
    pathname === key || pathname.startsWith(key + "/")
  )?.[1] ?? "";

  const activeSegment = pathname.split("/").filter(Boolean)[0] ?? "";
  const activeDock = DOCK_MAP["/" + activeSegment] ?? DOCK_MAP[pathname] ?? "home";

  return (
    <div className="app">
      <Topbar breadcrumb={breadcrumb} />
      <main className="app-main">
        {children}
      </main>
      <Dock active={activeDock} />
    </div>
  );
};

export default AppShell;