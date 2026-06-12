//Leonardo Stuani Godoi
import { useRef, useState } from "react";
import { Sun, Moon, ArrowRight, Fingerprint, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { StuaniMark, StuaniLogo } from "../Logo";
import showSnackbar from "../../utils/snackbar";

const LoginForm = () => {
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isDark = theme === "dark";
  const cpfRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cpfDigits = cpf.replace(/\D/g, "");
    if (!cpfDigits || !senha) {
      showSnackbar("Informe CPF e senha.", "error");
      setError(true);
      return;
    }
    setSubmitting(true);
    const ok = await login(cpfDigits, senha);
    setSubmitting(false);
    setError(!ok);
    if (!ok) setSenha("");
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia,";
    if (h < 18) return "Boa tarde,";
    return "Boa noite,";
  })();

  const inputBase = {
    width: "100%",
    padding: "13px 16px 13px 42px",
    fontSize: 14,
    fontFamily: "inherit",
    borderRadius: "var(--radius)",
    background: "var(--surface-2)",
    color: "var(--ink)",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  return (
    <div className="login-layout">
      {/* ── Left panel (brand) ── */}
      <div className="login-brand">
        <StuaniLogo size="lg" dark />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 11,
            color: "var(--accent)",
            fontFamily: "JetBrains Mono, monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 14,
          }}>
            ● caixa aberto · {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
          <h1 className="serif" style={{
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            margin: 0,
            color: "var(--surface)",
          }}>
            {greeting}<br />
            <span style={{ color: "var(--accent)" }}>bora abrir essa bagaça?</span>
          </h1>
          <p style={{
            fontSize: 14,
            color: "rgba(250,247,242,0.6)",
            marginTop: 18,
            maxWidth: 360,
            lineHeight: 1.6,
          }}>
            Comandas Stuani, melhor sistema para seu estabelecimento!
          </p>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 11,
          color: "rgba(250,247,242,0.35)",
          fontFamily: "JetBrains Mono, monospace",
        }}>
          <span>v2.0 · {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
          <span>Comandas Stuani</span>
        </div>

        {/* Watermark */}
        <div style={{ position: "absolute", right: -60, bottom: -60, opacity: 0.06, pointerEvents: "none" }}>
          <StuaniMark size={420} dark />
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="login-form">
        <div style={{ maxWidth: 360, width: "100%", margin: "0 auto" }}>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>entrar</div>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 28px", color: "var(--ink)" }}>
            Acesse sua conta
          </h2>

          <form onSubmit={handleSubmit}>
            {/* CPF */}
            <div style={{ marginBottom: 16 }}>
              <div className="section-eyebrow" style={{ marginBottom: 8 }}>cpf</div>
              <div style={{ position: "relative" }}>
                <Fingerprint size={16} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
                <input
                  ref={cpfRef}
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => { setCpf(e.target.value); setError(false); }}
                  placeholder="Digite seu CPF"
                  autoComplete="username"
                  autoFocus
                  style={{ ...inputBase, border: `1.5px solid ${error ? "var(--bad)" : cpf ? "var(--accent)" : "var(--line-2)"}` }}
                />
              </div>
            </div>

            {/* Senha */}
            <div style={{ marginBottom: 16 }}>
              <div className="section-eyebrow" style={{ marginBottom: 8 }}>senha</div>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }} />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(false); }}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  style={{ ...inputBase, border: `1.5px solid ${error ? "var(--bad)" : senha ? "var(--accent)" : "var(--line-2)"}` }}
                />
              </div>
              {error && (
                <div style={{ fontSize: 12, color: "var(--bad)", marginTop: 6 }}>
                  CPF ou senha inválidos.
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-accent btn-lg btn-full" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: "var(--ink-3)" }}>
              Esqueci minha senha! azar é o seu! De seus Pulos
            </span>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title="Alternar tema"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;