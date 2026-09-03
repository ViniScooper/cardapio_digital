// ============================================================
// src/pages/Admin.jsx — Painel 100% Responsivo (Mobile-First)
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import api, { API_BASE_URL as API_URL } from "../services/api";

const ICONES_SUGERIDOS = ["🍽️","🍕","🍔","🍟","🥩","🍗","🐟","🦐","🥗","🍲","🥓","🧀","🌿","🍺","🍹","🥤","☕","🍰","🎂","🍦","🎉","🍴","⭐","🔥","💎"];

const getEmoji = (nome = "") => {
    const n = nome.toLowerCase();
    if (n.includes("pizza"))     return "🍕";
    if (n.includes("hamburguer") || n.includes("burger")) return "🍔";
    if (n.includes("macarrão"))  return "🍝";
    if (n.includes("salada"))    return "🥗";
    if (n.includes("caldo") || n.includes("caldinho")) return "🍲";
    if (n.includes("frango") || n.includes("isca")) return "🍗";
    if (n.includes("peixe") || n.includes("bacalhau")) return "🐟";
    if (n.includes("camarão"))   return "🦐";
    if (n.includes("carne") || n.includes("bife")) return "🥩";
    if (n.includes("torresmo"))  return "🥓";
    if (n.includes("queijo"))    return "🧀";
    if (n.includes("macaxeira")) return "🌿";
    if (n.includes("cerveja"))   return "🍺";
    if (n.includes("caipirinha")) return "🍹";
    if (n.includes("combo") || n.includes("promoção")) return "🎉";
    return "🍴";
};

const FORM_VAZIO = { nome: "", descricao: "", preco: "", categoria: "", happy_hour: false };

export default function Admin() {
    const [aba,        setAba]        = useState("pratos");
    const [pratos,     setPratos]     = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [enviando,   setEnviando]   = useState(false);
    const [mensagem,   setMensagem]   = useState("");
    const [erro,       setErro]       = useState("");

    const [form,       setForm]       = useState(FORM_VAZIO);
    const [imagem,     setImagem]     = useState(null);
    const [preview,    setPreview]    = useState(null);
    const [editandoId, setEditandoId] = useState(null);
    const [filtroHH,   setFiltroHH]   = useState(false);
    const inputFileRef = useRef(null);

    const [catNome,    setCatNome]    = useState("");
    const [catIcone,   setCatIcone]   = useState("🍴");
    const [enviandoCat,setEnviandoCat]= useState(false);

    // Configuração de Happy Hour
    const [configHH,   setConfigHH]   = useState({
        hh_ativo: true,
        hh_dias: "Segunda, Terça e Quarta",
        hh_inicio: "19:00",
        hh_fim: "22:00"
    });
    const [salvandoHH, setSalvandoHH] = useState(false);

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

    const carregarTudo = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.get("/pratos"),
            api.get("/categorias"),
            api.get("/config")
        ])
            .then(([rPratos, rCats, rConfig]) => {
                setPratos(rPratos.data);
                setCategorias(rCats.data);
                if (rConfig?.data) {
                    setConfigHH({
                        hh_ativo: !!rConfig.data.hh_ativo,
                        hh_dias: rConfig.data.hh_dias || "Segunda, Terça e Quarta",
                        hh_inicio: rConfig.data.hh_inicio || "19:00",
                        hh_fim: rConfig.data.hh_fim || "22:00"
                    });
                }
                if (!form.categoria && rCats.data.length > 0) {
                    setForm(f => ({ ...f, categoria: rCats.data[0].nome }));
                }
            })
            .catch(() => setErro("Erro ao carregar dados."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { carregarTudo(); }, [carregarTudo]);

    const handleImagemChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagem(file);
        setPreview(URL.createObjectURL(file));
    };

    const limparImagem = () => {
        setImagem(null);
        setPreview(null);
        if (inputFileRef.current) inputFileRef.current.value = "";
    };

    const limparForm = () => {
        setForm({ ...FORM_VAZIO, categoria: categorias[0]?.nome || "" });
        limparImagem();
        setEditandoId(null);
        setErro("");
        setMensagem("");
    };

    const iniciarEdicao = (prato) => {
        setAba("pratos");
        setEditandoId(prato.id);
        setForm({
            nome:       prato.nome,
            descricao:  prato.descricao || "",
            preco:      prato.preco,
            categoria:  prato.categoria || categorias[0]?.nome || "",
            happy_hour: !!prato.happy_hour
        });
        setPreview(prato.imagem ? `${API_URL}${prato.imagem}` : null);
        setImagem(null);
        setErro("");
        setMensagem("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(""); setMensagem(""); setEnviando(true);
        try {
            const fd = new FormData();
            fd.append("nome",       form.nome);
            fd.append("descricao",  form.descricao);
            fd.append("preco",      form.preco);
            fd.append("categoria",  form.categoria);
            fd.append("happy_hour", form.happy_hour ? "true" : "false");
            if (imagem) fd.append("imagem", imagem);

            if (editandoId) {
                await api.put(`/pratos/${editandoId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                setMensagem(`"${form.nome}" atualizado!`);
            } else {
                await api.post("/pratos", fd, { headers: { "Content-Type": "multipart/form-data" } });
                setMensagem(`"${form.nome}" publicado!`);
            }
            limparForm();
            carregarTudo();
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao salvar.");
        } finally {
            setEnviando(false);
        }
    };

    const handleDeletar = async (id, nomePrato) => {
        if (!window.confirm(`Remover "${nomePrato}" do cardápio?`)) return;
        try {
            await api.delete(`/pratos/${id}`);
            setMensagem(`"${nomePrato}" removido.`);
            carregarTudo();
            if (editandoId === id) limparForm();
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao remover.");
        }
    };

    const handleCriarCategoria = async (e) => {
        e.preventDefault();
        if (!catNome.trim()) return;
        setErro(""); setMensagem(""); setEnviandoCat(true);
        try {
            await api.post("/categorias", { nome: catNome.trim(), icone: catIcone });
            setMensagem(`Categoria "${catNome}" criada!`);
            setCatNome("");
            setCatIcone("🍴");
            carregarTudo();
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao criar categoria.");
        } finally {
            setEnviandoCat(false);
        }
    };

    const handleDeletarCategoria = async (id, nome) => {
        if (!window.confirm(`Remover a categoria "${nome}"?`)) return;
        try {
            await api.delete(`/categorias/${id}`);
            setMensagem(`Categoria "${nome}" removida.`);
            carregarTudo();
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao remover categoria.");
        }
    };

    const handleSalvarConfigHH = async (e) => {
        e.preventDefault();
        setErro("");
        setMensagem("");
        setSalvandoHH(true);
        try {
            await api.put("/config/happy-hour", configHH);
            setMensagem("Configurações do Happy Hour salvas com sucesso!");
        } catch (err) {
            setErro(err.response?.data?.erro || "Erro ao salvar configurações.");
        } finally {
            setSalvandoHH(false);
        }
    };

    const pratosFiltrados = filtroHH ? pratos.filter(p => p.happy_hour) : pratos;

    return (
        <div style={styles.page}>

            {/* ── HEADER ── */}
            <div className="admin-header" style={styles.header}>
                <div className="admin-header-content" style={styles.headerContent}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                        <img src="/logo.png" alt="Logo" style={styles.headerLogo} />
                        <div>
                            <p style={styles.headerLabel}>Boteco do Sivirino</p>
                            <h1 className="admin-header-title" style={styles.headerTitulo}>Painel Admin</h1>
                        </div>
                    </div>
                    <div className="admin-header-user" style={styles.headerUser}>
                        <div style={styles.avatar}>{usuario.nome ? usuario.nome[0].toUpperCase() : "A"}</div>
                        <div>
                            <p style={styles.avatarNome}>{usuario.nome}</p>
                            <p style={styles.avatarRole}>Administrador</p>
                        </div>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="admin-stats" style={styles.stats}>
                    {[
                        { num: pratos.length,                           label: "Pratos" },
                        { num: categorias.length,                       label: "Categorias" },
                        { num: pratos.filter(p => p.happy_hour).length, label: "Happy Hour" },
                        { num: pratos.length > 0 ? `R$ ${Math.min(...pratos.map(p => parseFloat(p.preco))).toFixed(2).replace(".", ",")}` : "—", label: "A partir de" },
                    ].map((s, i) => (
                        <div key={i} className="admin-stat-card" style={styles.statCard}>
                            <span className="admin-stat-num" style={styles.statNum}>{s.num}</span>
                            <span className="admin-stat-label" style={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* Abas */}
                <div className="admin-abas" style={styles.abas}>
                    <button onClick={() => setAba("pratos")}     className="admin-aba" style={{ ...styles.aba, ...(aba === "pratos"     ? styles.abaAtiva : {}) }}>🍽️ Pratos</button>
                    <button onClick={() => setAba("categorias")} className="admin-aba" style={{ ...styles.aba, ...(aba === "categorias" ? styles.abaAtiva : {}) }}>🏷️ Categorias</button>
                    <button onClick={() => setAba("happyhour")}  className="admin-aba" style={{ ...styles.aba, ...(aba === "happyhour"  ? styles.abaAtiva : {}) }}>⚡ Happy Hour</button>
                    <button onClick={() => setAba("qrcode")}     className="admin-aba" style={{ ...styles.aba, ...(aba === "qrcode"     ? styles.abaAtiva : {}) }}>📱 QR Code</button>
                </div>
            </div>

            {/* ── ABA PRATOS ── */}
            {aba === "pratos" && (
                <div className="admin-body" style={styles.body}>

                    {/* Formulário prato */}
                    <div className="admin-card" style={styles.card}>
                        <h2 className="admin-card-titulo" style={styles.cardTitulo}>{editandoId ? "✏️ Editar Prato" : "➕ Novo Prato"}</h2>
                        <form onSubmit={handleSubmit} style={styles.form}>

                            {/* Imagem */}
                            <div style={styles.grupo}>
                                <label style={styles.label}>Foto do Prato</label>
                                {preview ? (
                                    <div style={styles.previewImgBox}>
                                        <img src={preview} alt="preview" style={styles.previewImg} />
                                        <button type="button" onClick={limparImagem} style={styles.btnRemoverImg}>✕ Remover foto</button>
                                    </div>
                                ) : (
                                    <div style={styles.uploadZone} onClick={() => inputFileRef.current?.click()}>
                                        <span style={{ fontSize: "2rem" }}>📷</span>
                                        <p style={{ fontWeight: "600", color: "#555", fontSize: "0.9rem", marginTop: "0.4rem" }}>Clique para adicionar foto</p>
                                        <p style={{ color: "#bbb", fontSize: "0.78rem" }}>JPG, PNG ou WebP — máx. 5MB</p>
                                    </div>
                                )}
                                <input ref={inputFileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImagemChange} style={{ display: "none" }} />
                            </div>

                            <div style={styles.grupo}>
                                <label style={styles.label}>Nome do Prato *</label>
                                <input style={styles.input} type="text" placeholder="Ex: Pizza Calabresa" value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} required />
                            </div>

                            <div style={styles.grupo}>
                                <label style={styles.label}>Descrição</label>
                                <input style={styles.input} type="text" placeholder="Ex: Calabresa, queijo e molho especial" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} />
                            </div>

                            <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                                <div style={styles.grupo}>
                                    <label style={styles.label}>Preço (R$) *</label>
                                    <input style={styles.input} type="number" placeholder="0,00" step="0.01" min="0.01" value={form.preco} onChange={(e) => setForm(f => ({ ...f, preco: e.target.value }))} required />
                                </div>
                                <div style={styles.grupo}>
                                    <label style={styles.label}>Categoria</label>
                                    <select style={{ ...styles.input, cursor: "pointer" }} value={form.categoria} onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}>
                                        {categorias.map(c => (
                                            <option key={c.id} value={c.nome}>{c.icone} {c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Toggle Happy Hour */}
                            <div style={styles.hhToggle} onClick={() => setForm(f => ({ ...f, happy_hour: !f.happy_hour }))}>
                                <div style={{ ...styles.hhToggleBox, ...(form.happy_hour ? styles.hhToggleAtivo : {}) }}>
                                    <div style={{ ...styles.hhToggleCircle, ...(form.happy_hour ? styles.hhToggleCircleAtivo : {}) }} />
                                </div>
                                <div>
                                    <p style={styles.hhToggleLabel}>🍺 Happy Hour</p>
                                    <p style={styles.hhToggleSub}>{form.happy_hour ? "Prato com desconto no Happy Hour" : "Clique para incluir na promoção"}</p>
                                </div>
                            </div>

                            {/* Preview */}
                            {form.nome && form.preco && (
                                <div style={styles.previewCard}>
                                    <p style={styles.previewLabel}>Pré-visualização</p>
                                    <div style={styles.previewInner}>
                                        {preview ? <img src={preview} alt="prev" style={styles.previewCardImg} />
                                                 : <div style={styles.previewEmojiBg}>{getEmoji(form.nome)}</div>}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: "0.9rem", fontWeight: "700", color: "#333" }}>{form.nome}</p>
                                            {form.descricao && <p style={{ fontSize: "0.78rem", color: "#aaa" }}>{form.descricao}</p>}
                                            <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                                                {form.categoria && (
                                                    <span style={{ background: "#f0ebe3", color: "#888", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.72rem" }}>
                                                        {categorias.find(c => c.nome === form.categoria)?.icone} {form.categoria}
                                                    </span>
                                                )}
                                                {form.happy_hour && <span style={{ background: "#e8b84b", color: "#111", padding: "0.15rem 0.5rem", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "700" }}>🍺 Happy Hour</span>}
                                            </div>
                                        </div>
                                        <span style={styles.previewPreco}>R$ {parseFloat(form.preco || 0).toFixed(2).replace(".", ",")}</span>
                                    </div>
                                </div>
                            )}

                            {erro     && <div style={styles.alertaErro}>⚠️ {erro}</div>}
                            {mensagem && <div style={styles.alertaSucesso}>✅ {mensagem}</div>}

                            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                <button style={styles.btnAdicionar} type="submit" disabled={enviando}>
                                    {enviando ? "Salvando..." : editandoId ? "💾 Salvar Alterações" : "Publicar no Cardápio"}
                                </button>
                                {editandoId && <button type="button" onClick={limparForm} style={styles.btnCancelar}>Cancelar</button>}
                            </div>
                        </form>
                    </div>

                    {/* Lista pratos */}
                    <div className="admin-card" style={styles.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #f0ebe3", gap: "0.5rem", flexWrap: "wrap" }}>
                            <h2 className="admin-card-titulo" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
                                📋 Pratos ({pratosFiltrados.length})
                            </h2>
                            <button onClick={() => setFiltroHH(!filtroHH)} style={{ ...styles.filtroBtnHH, ...(filtroHH ? styles.filtroBtnHHAtivo : {}) }}>
                                🍺 {filtroHH ? "Ver todos" : "Só Happy Hour"}
                            </button>
                        </div>

                        {loading ? <div style={styles.center}><div style={styles.spinner} /></div>
                        : pratosFiltrados.length === 0 ? <div style={styles.vazio}><p style={{ fontSize: "2rem" }}>🍽️</p><p style={{ color: "#aaa", marginTop: "0.5rem" }}>Nenhum prato cadastrado</p></div>
                        : (
                            <div style={styles.lista}>
                                {pratosFiltrados.map((prato) => (
                                    <div key={prato.id} className="admin-item" style={{ ...styles.item, ...(prato.id === editandoId ? styles.itemEditando : {}) }}>
                                        <div className="admin-item-left" style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1, minWidth: 0 }}>
                                            {prato.imagem ? <img src={`${API_URL}${prato.imagem}`} alt={prato.nome} style={styles.itemThumb} />
                                                           : <div style={styles.itemEmojiBg}>{getEmoji(prato.nome)}</div>}
                                            <div style={styles.itemInfo}>
                                                <p style={styles.itemNome}>{prato.nome}</p>
                                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                                                    <span style={styles.badgeCat}>
                                                        {categorias.find(c => c.nome === prato.categoria)?.icone || "🍴"} {prato.categoria}
                                                    </span>
                                                    {prato.happy_hour ? <span style={styles.badgeHH}>🍺 HH</span> : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="admin-item-dir" style={styles.itemDir}>
                                            <span style={styles.itemPreco}>R$ {parseFloat(prato.preco).toFixed(2).replace(".", ",")}</span>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button className="admin-btn-action" style={styles.btnEditar} onClick={() => iniciarEdicao(prato)} title="Editar">✏️</button>
                                                <button className="admin-btn-action" style={styles.btnDel} onClick={() => handleDeletar(prato.id, prato.nome)} title="Remover">🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── ABA CATEGORIAS ── */}
            {aba === "categorias" && (
                <div className="admin-body" style={styles.body}>

                    {/* Form nova categoria */}
                    <div className="admin-card" style={styles.card}>
                        <h2 className="admin-card-titulo" style={styles.cardTitulo}>🏷️ Nova Categoria</h2>
                        <form onSubmit={handleCriarCategoria} style={styles.form}>

                            <div style={styles.grupo}>
                                <label style={styles.label}>Nome da Categoria *</label>
                                <input style={styles.input} type="text" placeholder="Ex: Frutos do Mar"
                                    value={catNome} onChange={(e) => setCatNome(e.target.value)} required />
                            </div>

                            <div style={styles.grupo}>
                                <label style={styles.label}>Ícone / Emoji</label>
                                <input style={{ ...styles.input, fontSize: "1.5rem", textAlign: "center" }}
                                    type="text" placeholder="🍴"
                                    value={catIcone} onChange={(e) => setCatIcone(e.target.value)} maxLength={4} />
                            </div>

                            <div style={styles.grupo}>
                                <label style={styles.label}>Sugestões de Ícones</label>
                                <div style={styles.iconesSugeridos}>
                                    {ICONES_SUGERIDOS.map(ic => (
                                        <button key={ic} type="button"
                                            onClick={() => setCatIcone(ic)}
                                            style={{ ...styles.iconeSug, ...(catIcone === ic ? styles.iconeSugAtivo : {}) }}>
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {catNome && (
                                <div style={styles.previewCard}>
                                    <p style={styles.previewLabel}>Como vai aparecer no cardápio</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                        <span style={{ fontSize: "2rem" }}>{catIcone}</span>
                                        <div>
                                            <p style={{ fontSize: "0.7rem", color: "#e8b84b", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "600" }}>{catIcone} {catNome}</p>
                                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: "700", color: "#1a1a1a" }}>{catNome}</p>
                                            <div style={{ width: "40px", height: "3px", background: "linear-gradient(90deg, #e8b84b, #c0392b)", borderRadius: "2px", marginTop: "4px" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {erro     && <div style={styles.alertaErro}>⚠️ {erro}</div>}
                            {mensagem && <div style={styles.alertaSucesso}>✅ {mensagem}</div>}

                            <button style={styles.btnAdicionar} type="submit" disabled={enviandoCat}>
                                {enviandoCat ? "Criando..." : "Criar Categoria"}
                            </button>
                        </form>
                    </div>

                    {/* Lista de categorias */}
                    <div className="admin-card" style={styles.card}>
                        <h2 className="admin-card-titulo" style={styles.cardTitulo}>📋 Categorias ({categorias.length})</h2>
                        <div style={styles.lista}>
                            {categorias.map((cat) => {
                                const qtd = pratos.filter(p => p.categoria === cat.nome).length;
                                return (
                                    <div key={cat.id} className="admin-cat-item" style={styles.catItem}>
                                        <div style={styles.catIconeBox}>{cat.icone}</div>
                                        <div style={styles.itemInfo}>
                                            <p style={styles.itemNome}>{cat.nome}</p>
                                            <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "0.1rem" }}>
                                                {qtd} {qtd === 1 ? "prato" : "pratos"}
                                            </p>
                                        </div>
                                        <button
                                            className="admin-btn-action"
                                            style={{ ...styles.btnDel, ...(qtd > 0 ? { opacity: 0.4, cursor: "not-allowed" } : {}) }}
                                            onClick={() => qtd === 0 && handleDeletarCategoria(cat.id, cat.nome)}
                                            title={qtd > 0 ? `${qtd} prato(s) usam esta categoria` : "Remover categoria"}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── ABA CONFIGURAÇÃO DE HAPPY HOUR ── */}
            {aba === "happyhour" && (
                <div className="admin-body" style={{ ...styles.body, gridTemplateColumns: "1fr", maxWidth: "800px" }}>
                    <div className="admin-card" style={styles.card}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "2rem" }}>⚡</span>
                            <div>
                                <h2 className="admin-card-titulo" style={{ ...styles.cardTitulo, margin: 0, paddingBottom: 0, border: "none" }}>
                                    Configurar Happy Hour
                                </h2>
                                <p style={{ color: "#777", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                                    Defina os dias da semana e os horários em que as promoções estarão ativas.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSalvarConfigHH} style={styles.form}>
                            {/* Toggle Ativar/Desativar */}
                            <div
                                style={styles.hhToggle}
                                onClick={() => setConfigHH(c => ({ ...c, hh_ativo: !c.hh_ativo }))}
                            >
                                <div style={{ ...styles.hhToggleBox, ...(configHH.hh_ativo ? styles.hhToggleAtivo : {}) }}>
                                    <div style={{ ...styles.hhToggleCircle, ...(configHH.hh_ativo ? styles.hhToggleCircleAtivo : {}) }} />
                                </div>
                                <div>
                                    <p style={styles.hhToggleLabel}>
                                        {configHH.hh_ativo ? "✅ Happy Hour Ativado no Cardápio" : "⏸️ Happy Hour Pausado"}
                                    </p>
                                    <p style={styles.hhToggleSub}>
                                        {configHH.hh_ativo ? "A seção e o banner especial aparecerão para os clientes." : "A seção ficará oculta do cardápio público."}
                                    </p>
                                </div>
                            </div>

                            {/* Dias da semana */}
                            <div style={styles.grupo}>
                                <label style={styles.label}>Dias de Happy Hour *</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    placeholder="Ex: Segunda, Terça e Quarta"
                                    value={configHH.hh_dias}
                                    onChange={(e) => setConfigHH(c => ({ ...c, hh_dias: e.target.value }))}
                                    required
                                />
                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                                    {[
                                        "Segunda, Terça e Quarta",
                                        "Quarta a Sexta",
                                        "Terça a Domingo",
                                        "Todos os dias"
                                    ].map((sug) => (
                                        <button
                                            key={sug}
                                            type="button"
                                            onClick={() => setConfigHH(c => ({ ...c, hh_dias: sug }))}
                                            style={{
                                                background: "#faf8f5",
                                                border: "1px solid #e0d9d0",
                                                padding: "0.25rem 0.65rem",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                cursor: "pointer",
                                                color: "#666"
                                            }}
                                        >
                                            + {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Horários (Início e Fim) */}
                            <div className="admin-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div style={styles.grupo}>
                                    <label style={styles.label}>Horário de Início *</label>
                                    <input
                                        style={styles.input}
                                        type="time"
                                        value={configHH.hh_inicio}
                                        onChange={(e) => setConfigHH(c => ({ ...c, hh_inicio: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div style={styles.grupo}>
                                    <label style={styles.label}>Horário de Término *</label>
                                    <input
                                        style={styles.input}
                                        type="time"
                                        value={configHH.hh_fim}
                                        onChange={(e) => setConfigHH(c => ({ ...c, hh_fim: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pré-visualização do Banner */}
                            <div style={{ ...styles.previewCard, background: "linear-gradient(135deg, #1a1200, #0d0903)", border: "1px solid #e8b84b", color: "#fff" }}>
                                <p style={{ ...styles.previewLabel, color: "#e8b84b" }}>Como os clientes verão no cardápio:</p>
                                <div style={{ textAlign: "center", padding: "0.8rem 0" }}>
                                    <p style={{ color: "#e8b84b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                                        ⚡ Promoções Especiais
                                    </p>
                                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: "700", color: "#fff", marginBottom: "0.6rem" }}>
                                        Happy Hour
                                    </h3>
                                    <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.6rem",
                                        flexWrap: "wrap",
                                        background: "rgba(232, 184, 75, 0.15)",
                                        border: "1px solid #e8b84b",
                                        color: "#e8b84b",
                                        padding: "0.4rem 1.2rem",
                                        borderRadius: "50px",
                                        fontSize: "0.85rem",
                                        fontWeight: "600"
                                    }}>
                                        <span>📅 {configHH.hh_dias || "Segunda, Terça e Quarta"}</span>
                                        <span style={{ opacity: 0.5 }}>•</span>
                                        <span>⏰ Das {configHH.hh_inicio || "19:00"} às {configHH.hh_fim || "22:00"}</span>
                                    </div>
                                </div>
                            </div>

                            {erro     && <div style={styles.alertaErro}>⚠️ {erro}</div>}
                            {mensagem && <div style={styles.alertaSucesso}>✅ {mensagem}</div>}

                            <button style={styles.btnAdicionar} type="submit" disabled={salvandoHH}>
                                {salvandoHH ? "Salvando..." : "💾 Salvar Configurações de Happy Hour"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── ABA QR CODE ── */}
            {aba === "qrcode" && (
                <div className="admin-body" style={{ ...styles.body, gridTemplateColumns: "1fr", maxWidth: "800px" }}>
                    <div className="admin-card" style={{ ...styles.card, textAlign: "center", padding: "2.5rem 1.5rem" }}>
                        <div style={{ display: "inline-block", background: "#fff8e7", padding: "0.8rem", borderRadius: "50%", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "2.5rem" }}>📱</span>
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.5rem" }}>
                            QR Code do Cardápio
                        </h2>
                        <p style={{ color: "#777", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto 1.5rem", lineHeight: "1.6" }}>
                            Imprima ou mostre este QR Code nas mesas para os clientes acessarem o cardápio direto pelo celular!
                        </p>

                        <div style={{ background: "#faf8f5", border: "2px dashed #e8e0d5", borderRadius: "16px", padding: "1.5rem", display: "inline-block", maxWidth: "100%" }}>
                            <QRCodeSVG
                                value={typeof window !== "undefined" ? `${window.location.origin}/` : "http://localhost:5173"}
                                size={220}
                                level="H"
                                includeMargin={true}
                                style={{ maxWidth: "100%", height: "auto" }}
                            />
                            <p style={{ marginTop: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#333", wordBreak: "break-all" }}>
                                {typeof window !== "undefined" ? `${window.location.origin}/` : "http://localhost:5173"}
                            </p>
                        </div>

                        <div style={{ marginTop: "1.8rem", display: "flex", justifyContent: "center" }}>
                            <button
                                onClick={() => window.print()}
                                style={{ ...styles.btnAdicionar, padding: "0.8rem 2rem", borderRadius: "50px", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                🖨️ Imprimir QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    page: { minHeight: "calc(100vh - 70px)", background: "#f2ede6" },
    header: { background: "linear-gradient(135deg, #111111 0%, #1a1209 100%)", padding: "2.2rem 2.5rem 0" },
    headerContent: { maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1.8rem" },
    headerLogo: { width: "46px", height: "46px", borderRadius: "50%", border: "2px solid #e8b84b", objectFit: "cover" },
    headerLabel: { color: "#e8b84b", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.3rem" },
    headerTitulo: { fontFamily: "'Playfair Display', serif", fontSize: "1.9rem", fontWeight: "700", color: "#ffffff" },
    headerUser: { display: "flex", alignItems: "center", gap: "0.8rem" },
    avatar: { width: "42px", height: "42px", borderRadius: "50%", background: "#e8b84b", color: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "1.1rem" },
    avatarNome: { color: "#fff", fontSize: "0.9rem", fontWeight: "600" },
    avatarRole: { color: "#888", fontSize: "0.75rem" },
    stats: { maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "1px" },
    statCard: { flex: 1, background: "rgba(255,255,255,0.05)", padding: "1.1rem 1.4rem", display: "flex", flexDirection: "column", gap: "0.2rem", borderTop: "1px solid rgba(255,255,255,0.08)" },
    statNum: { fontFamily: "'Playfair Display', serif", fontSize: "1.45rem", fontWeight: "700", color: "#e8b84b" },
    statLabel: { color: "#777", fontSize: "0.75rem" },

    /* Abas */
    abas: { maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "0.3rem", paddingTop: "1.5rem" },
    aba: { padding: "0.7rem 1.5rem", background: "transparent", border: "none", color: "#888", fontSize: "0.9rem", cursor: "pointer", borderRadius: "8px 8px 0 0", fontFamily: "'Poppins', sans-serif", fontWeight: "500", transition: "all 0.2s" },
    abaAtiva: { background: "#f2ede6", color: "#1a1a1a", fontWeight: "700" },

    body: { maxWidth: "1200px", margin: "0 auto", padding: "2rem 2.5rem", display: "grid", gridTemplateColumns: "400px 1fr", gap: "1.5rem", alignItems: "start" },
    card: { background: "#ffffff", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" },
    cardTitulo: { fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "2px solid #f0ebe3" },
    form: { display: "flex", flexDirection: "column", gap: "1rem" },
    grupo: { display: "flex", flexDirection: "column", gap: "0.4rem" },
    label: { fontSize: "0.75rem", fontWeight: "600", color: "#888", letterSpacing: "0.8px", textTransform: "uppercase" },
    input: { padding: "0.75rem 1rem", border: "1.5px solid #e8e0d5", borderRadius: "10px", fontSize: "0.9rem", background: "#faf8f5", outline: "none", color: "#1a1a1a", width: "100%" },

    iconesSugeridos: { display: "flex", flexWrap: "wrap", gap: "0.4rem" },
    iconeSug: { width: "36px", height: "36px", fontSize: "1.2rem", background: "#faf8f5", border: "1.5px solid #e8e0d5", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
    iconeSugAtivo: { border: "2px solid #e8b84b", background: "#fff8e7" },

    uploadZone: { border: "2px dashed #e0d5c5", borderRadius: "12px", padding: "1.5rem 1rem", textAlign: "center", cursor: "pointer", background: "#faf8f5" },
    previewImgBox: { position: "relative", borderRadius: "12px", overflow: "hidden" },
    previewImg: { width: "100%", height: "160px", objectFit: "cover", display: "block", borderRadius: "12px" },
    btnRemoverImg: { position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "6px", padding: "0.3rem 0.7rem", fontSize: "0.78rem", cursor: "pointer" },

    hhToggle: { display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 1rem", background: "#faf8f5", borderRadius: "10px", border: "1.5px solid #e8e0d5", cursor: "pointer", userSelect: "none" },
    hhToggleBox: { width: "44px", height: "24px", borderRadius: "12px", background: "#ddd", position: "relative", transition: "background 0.2s", flexShrink: 0 },
    hhToggleAtivo: { background: "#e8b84b" },
    hhToggleCircle: { position: "absolute", top: "3px", left: "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" },
    hhToggleCircleAtivo: { left: "23px" },
    hhToggleLabel: { fontSize: "0.9rem", fontWeight: "600", color: "#333" },
    hhToggleSub: { fontSize: "0.72rem", color: "#aaa", marginTop: "0.1rem" },

    previewCard: { background: "#faf8f5", borderRadius: "10px", padding: "1rem", border: "1.5px dashed #e0d9d0" },
    previewLabel: { fontSize: "0.72rem", fontWeight: "600", color: "#bbb", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "0.6rem" },
    previewInner: { display: "flex", gap: "0.8rem", alignItems: "center" },
    previewCardImg: { width: "52px", height: "52px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 },
    previewEmojiBg: { width: "52px", height: "52px", background: "#fff8e7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 },
    previewPreco: { marginLeft: "auto", background: "linear-gradient(135deg, #c0392b, #96281b)", color: "#fff", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.82rem", fontWeight: "700", whiteSpace: "nowrap" },

    alertaErro:    { background: "#fdecea", color: "#c0392b", padding: "0.7rem 1rem", borderRadius: "8px", fontSize: "0.85rem", borderLeft: "4px solid #c0392b" },
    alertaSucesso: { background: "#e8f5e9", color: "#2e7d32", padding: "0.7rem 1rem", borderRadius: "8px", fontSize: "0.85rem", borderLeft: "4px solid #2e7d32" },
    btnAdicionar: { flex: 1, padding: "0.85rem", background: "linear-gradient(135deg, #c0392b, #96281b)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.92rem", fontWeight: "600", cursor: "pointer", minWidth: "180px" },
    btnCancelar:  { padding: "0.85rem 1.2rem", background: "transparent", border: "1.5px solid #ddd", color: "#888", borderRadius: "10px", fontSize: "0.9rem", cursor: "pointer" },

    filtroBtnHH: { background: "transparent", border: "1.5px solid #e8e0d5", color: "#888", padding: "0.35rem 0.8rem", borderRadius: "20px", fontSize: "0.78rem", cursor: "pointer" },
    filtroBtnHHAtivo: { background: "#e8b84b", border: "1.5px solid #e8b84b", color: "#111", fontWeight: "700" },
    lista: { display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "580px", overflowY: "auto", paddingRight: "0.2rem" },
    item:  { display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.75rem", background: "#faf8f5", borderRadius: "10px", border: "1px solid #ede8e0" },
    itemEditando: { border: "2px solid #e8b84b", background: "#fffdf5" },
    itemThumb: { width: "46px", height: "46px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 },
    itemEmojiBg: { width: "46px", height: "46px", background: "#fff8e7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 },
    itemInfo: { flex: 1, minWidth: 0 },
    itemNome: { fontSize: "0.88rem", fontWeight: "600", color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    badgeCat: { background: "#f0ebe3", color: "#888", padding: "0.1rem 0.5rem", borderRadius: "20px", fontSize: "0.7rem" },
    badgeHH:  { background: "#e8b84b", color: "#111", padding: "0.1rem 0.5rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" },
    itemDir:  { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 },
    itemPreco: { background: "linear-gradient(135deg, #c0392b, #96281b)", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", whiteSpace: "nowrap" },
    btnEditar: { background: "transparent", border: "1px solid #e0d9d0", borderRadius: "7px", cursor: "pointer", padding: "0.25rem 0.45rem", fontSize: "0.85rem" },
    btnDel:    { background: "transparent", border: "1px solid #e0d9d0", borderRadius: "7px", cursor: "pointer", padding: "0.25rem 0.45rem", fontSize: "0.85rem" },

    catItem: { display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.9rem 1rem", background: "#faf8f5", borderRadius: "10px", border: "1px solid #ede8e0" },
    catIconeBox: { width: "42px", height: "42px", background: "linear-gradient(135deg, #fff8e7, #fcefc7)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 },

    center: { textAlign: "center", padding: "3rem 0" },
    spinner: { width: "32px", height: "32px", border: "3px solid #f0ebe3", borderTop: "3px solid #e8b84b", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" },
    vazio: { textAlign: "center", padding: "3rem 0" },
};
