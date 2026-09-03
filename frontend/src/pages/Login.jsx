// ============================================================
// src/pages/Login.jsx — Tela de login elegante e responsiva
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
    const navigate = useNavigate();

    const [email,   setEmail]   = useState("");
    const [senha,   setSenha]   = useState("");
    const [erro,    setErro]    = useState("");
    const [mensagem,setMensagem]= useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro("");
        setMensagem("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, senha });
            localStorage.setItem("token",   res.data.token);
            localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
            setMensagem("Login realizado! Redirecionando...");
            setTimeout(() => {
                if (res.data.usuario.role === "admin") navigate("/admin");
                else navigate("/");
                window.location.reload();
            }, 800);
        } catch (err) {
            setErro(err.response?.data?.erro || "Email ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page" style={styles.page}>

            {/* Painel esquerdo decorativo */}
            <div className="login-painel-esq" style={styles.painelEsq}>
                <div className="login-painel-conteudo" style={styles.painelConteudo}>
                    <img src="/logo.png" alt="Logo" style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px solid #e8b84b", marginBottom: "1.2rem", objectFit: "cover" }} />
                    <p style={styles.painelLabel}>Boteco do Sivirino</p>
                    <h1 style={styles.painelTitulo}>Painel<br />Administrativo</h1>
                    <p style={styles.painelDesc}>
                        Gerencie pratos, fotos, categorias e promoções do seu cardápio.
                    </p>
                </div>
            </div>

            {/* Painel direito — formulário */}
            <div className="login-painel-dir" style={styles.painelDir}>
                <div className="login-form-box" style={styles.formBox}>

                    <Link to="/" style={styles.voltarLink}>← Voltar ao cardápio</Link>

                    <div style={styles.formIcone}>🔐</div>
                    <h2 style={styles.formTitulo}>Área Restrita</h2>
                    <p style={styles.formSub}>Acesse com suas credenciais de administrador</p>

                    <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.grupo}>
                            <label style={styles.label}>Email</label>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="admin@boteco.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.grupo}>
                            <label style={styles.label}>Senha</label>
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        {erro     && <div style={styles.alertaErro}>⚠️ {erro}</div>}
                        {mensagem && <div style={styles.alertaSucesso}>✅ {mensagem}</div>}

                        <button style={styles.btn} type="submit" disabled={loading}>
                            {loading ? (
                                <span style={styles.btnLoading}>
                                    <span style={styles.spinnerBtn} /> Entrando...
                                </span>
                            ) : "Entrar"}
                        </button>
                    </form>

                    <p style={styles.aviso}>
                        Acesso exclusivo para administradores do Boteco.
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        display:   "flex",
        minHeight: "calc(100vh - 74px)",
    },

    /* ── Painel esquerdo ── */
    painelEsq: {
        flex:           "0 0 45%",
        background:     "linear-gradient(160deg, #111111 0%, #1a1209 60%, #0d0905 100%)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "3rem",
        position:       "relative",
        overflow:       "hidden",
    },
    painelConteudo: {
        zIndex: 1,
    },
    painelLabel: {
        color:         "#e8b84b",
        fontSize:      "0.8rem",
        fontWeight:    "600",
        letterSpacing: "4px",
        textTransform: "uppercase",
        marginBottom:  "0.6rem",
    },
    painelTitulo: {
        fontFamily:   "'Playfair Display', serif",
        fontSize:     "clamp(2.2rem, 4vw, 3.5rem)",
        fontWeight:   "700",
        color:        "#ffffff",
        lineHeight:   "1.1",
        marginBottom: "1.2rem",
    },
    painelDesc: {
        color:      "#888",
        fontSize:   "0.92rem",
        lineHeight: "1.7",
        maxWidth:   "320px",
    },

    /* ── Painel direito ── */
    painelDir: {
        flex:           1,
        background:     "#f9f6f2",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        padding:        "3rem 2rem",
    },
    formBox: {
        width:    "100%",
        maxWidth: "400px",
    },
    voltarLink: {
        display:      "inline-block",
        color:        "#aaa",
        fontSize:     "0.8rem",
        marginBottom: "2rem",
        transition:   "color 0.2s",
    },
    formIcone: {
        fontSize:     "2.2rem",
        marginBottom: "0.8rem",
    },
    formTitulo: {
        fontFamily:   "'Playfair Display', serif",
        fontSize:     "1.8rem",
        fontWeight:   "700",
        color:        "#1a1a1a",
        marginBottom: "0.4rem",
    },
    formSub: {
        fontSize:     "0.85rem",
        color:        "#aaa",
        marginBottom: "2rem",
    },
    form: {
        display:       "flex",
        flexDirection: "column",
        gap:           "1rem",
    },
    grupo: {
        display:       "flex",
        flexDirection: "column",
        gap:           "0.4rem",
    },
    label: {
        fontSize:   "0.8rem",
        fontWeight: "600",
        color:      "#555",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
    },
    input: {
        padding:      "0.8rem 1rem",
        border:       "1.5px solid #e0d9d0",
        borderRadius: "10px",
        fontSize:     "0.95rem",
        background:   "#fff",
        outline:      "none",
        color:        "#1a1a1a",
        transition:   "border-color 0.2s",
    },
    alertaErro: {
        background:   "#fdecea",
        color:        "#c0392b",
        padding:      "0.75rem 1rem",
        borderRadius: "10px",
        fontSize:     "0.875rem",
        borderLeft:   "4px solid #c0392b",
    },
    alertaSucesso: {
        background:   "#e8f5e9",
        color:        "#2e7d32",
        padding:      "0.75rem 1rem",
        borderRadius: "10px",
        fontSize:     "0.875rem",
        borderLeft:   "4px solid #2e7d32",
    },
    btn: {
        padding:       "0.9rem",
        background:    "linear-gradient(135deg, #c0392b, #96281b)",
        color:         "#fff",
        border:        "none",
        borderRadius:  "10px",
        fontSize:      "0.95rem",
        fontWeight:    "600",
        cursor:        "pointer",
        marginTop:     "0.5rem",
        letterSpacing: "0.5px",
    },
    btnLoading: {
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        gap:        "0.5rem",
    },
    spinnerBtn: {
        width:        "16px",
        height:       "16px",
        border:       "2px solid rgba(255,255,255,0.3)",
        borderTop:    "2px solid #fff",
        borderRadius: "50%",
        display:      "inline-block",
        animation:    "spin 0.7s linear infinite",
    },
    aviso: {
        marginTop:  "2rem",
        fontSize:   "0.8rem",
        color:      "#bbb",
        textAlign:  "center",
        lineHeight: "1.6",
    },
};
