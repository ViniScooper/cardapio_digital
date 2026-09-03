// ============================================================
// src/pages/Home.jsx — Cardápio com seções e Happy Hour (Responsivo)
// ============================================================

import { useState, useEffect } from "react";
import api, { API_BASE_URL as API_URL } from "../services/api";

const getEmoji = (nome) => {
    const n = nome.toLowerCase();
    if (n.includes("pizza"))    return "🍕";
    if (n.includes("hamburguer") || n.includes("burger")) return "🍔";
    if (n.includes("macarrão") || n.includes("espaguete")) return "🍝";
    if (n.includes("salada"))   return "🥗";
    if (n.includes("sopa") || n.includes("caldo") || n.includes("caldinho")) return "🍲";
    if (n.includes("frango") || n.includes("galinha") || n.includes("isca")) return "🍗";
    if (n.includes("peixe") || n.includes("salmão") || n.includes("bacalhau")) return "🐟";
    if (n.includes("camarão"))  return "🦐";
    if (n.includes("carne") || n.includes("bife") || n.includes("churrasco")) return "🥩";
    if (n.includes("torresmo")) return "🥓";
    if (n.includes("queijo"))   return "🧀";
    if (n.includes("macaxeira") || n.includes("mandioca")) return "🌿";
    if (n.includes("sorvete"))  return "🍦";
    if (n.includes("bolo") || n.includes("torta")) return "🎂";
    if (n.includes("petisco"))  return "🍟";
    if (n.includes("cerveja"))  return "🍺";
    if (n.includes("caipirinha") || n.includes("cachaça")) return "🍹";
    if (n.includes("café") || n.includes("cafe")) return "☕";
    if (n.includes("combo") || n.includes("promoção")) return "🎉";
    return "🍴";
};

export default function Home() {
    const [pratos,     setPratos]     = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [config,     setConfig]     = useState({
        hh_ativo: 1,
        hh_dias: "Segunda, Terça e Quarta",
        hh_inicio: "19:00",
        hh_fim: "22:00"
    });
    const [loading,       setLoading]       = useState(true);
    const [erro,          setErro]          = useState("");
    const [menuCatAberto, setMenuCatAberto] = useState(false);

    // ── ESTADO DO CARRINHO DE PEDIDOS VIA WHATSAPP ──
    const [carrinho,      setCarrinho]      = useState(() => {
        try {
            const salvo = localStorage.getItem("carrinho_boteco");
            return salvo ? JSON.parse(salvo) : [];
        } catch {
            return [];
        }
    });
    const [modalCarrinho, setModalCarrinho] = useState(false);
    const [tipoEntrega,   setTipoEntrega]   = useState("mesa"); // "mesa" ou "delivery"
    const [dadosCliente,  setDadosCliente]  = useState({
        nome: "",
        mesa: "",
        endereco: "",
        pagamento: "Cartão (na mesa / entrega)",
        observacao: ""
    });

    useEffect(() => {
        try {
            localStorage.setItem("carrinho_boteco", JSON.stringify(carrinho));
        } catch (e) {}
    }, [carrinho]);

    const adicionarAoCarrinho = (prato) => {
        setCarrinho(prev => {
            const existe = prev.find(item => item.id === prato.id);
            if (existe) {
                return prev.map(item => item.id === prato.id ? { ...item, quantidade: item.quantidade + 1 } : item);
            }
            return [...prev, { ...prato, quantidade: 1 }];
        });
    };

    const alterarQtd = (id, delta) => {
        setCarrinho(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    const novaQtd = item.quantidade + delta;
                    return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const totalCarrinho = carrinho.reduce((acc, item) => acc + (parseFloat(item.preco) * item.quantidade), 0);
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

    const enviarPedidoWhatsApp = (e) => {
        e.preventDefault();
        if (carrinho.length === 0) return;

        const telBoteco = "5581982714421"; // Telefone do Boteco do Sivirino

        let msg = `🍻 *NOVO PEDIDO — BOTECO DO SIVIRINO*\n`;
        msg += `----------------------------------------\n`;
        if (dadosCliente.nome) msg += `👤 *Cliente:* ${dadosCliente.nome}\n`;
        if (tipoEntrega === "mesa") {
            msg += `📍 *Mesa no Salão:* ${dadosCliente.mesa || "Não informada"}\n`;
        } else {
            msg += `🛵 *Entrega Delivery:*\n${dadosCliente.endereco || "Endereço a combinar"}\n`;
        }
        msg += `💳 *Forma de Pagamento:* ${dadosCliente.pagamento}\n`;
        if (dadosCliente.observacao) {
            msg += `📝 *Observação:* ${dadosCliente.observacao}\n`;
        }
        msg += `----------------------------------------\n`;
        msg += `📋 *ITENS DO PEDIDO:*\n`;

        carrinho.forEach(item => {
            const subtotal = (parseFloat(item.preco) * item.quantidade).toFixed(2).replace(".", ",");
            msg += `• ${item.quantidade}x ${item.nome} — R$ ${subtotal}\n`;
        });

        msg += `----------------------------------------\n`;
        msg += `💰 *VALOR TOTAL:* R$ ${totalCarrinho.toFixed(2).replace(".", ",")}\n`;
        msg += `----------------------------------------\n`;
        msg += `_Pedido gerado automaticamente pelo cardápio digital._`;

        const linkUrl = `https://wa.me/${telBoteco}?text=${encodeURIComponent(msg)}`;
        window.open(linkUrl, "_blank");
    };

    useEffect(() => {
        Promise.all([
            api.get("/pratos"),
            api.get("/categorias"),
            api.get("/config")
        ])
            .then(([rPratos, rCats, rConfig]) => {
                setPratos(rPratos.data);
                setCategorias(rCats.data);
                if (rConfig?.data) setConfig(rConfig.data);
            })
            .catch(() => setErro("Não foi possível carregar o cardápio."))
            .finally(() => setLoading(false));
    }, []);

    // Ícone da categoria vindo do banco (com fallback)
    const getIconeCategoria = (nomecat) => {
        const cat = categorias.find(c => c.nome === nomecat);
        return cat?.icone || "🍴";
    };

    // Separa happy hour dos outros e agrupa por categoria
    const happyHourPratos = pratos.filter(p => p.happy_hour);

    // Lista de nomes de categorias que têm pratos normais (ordenado pelo banco)
    const nomesCategoria = categorias.length > 0
        ? categorias.map(c => c.nome).filter(nome => pratos.some(p => p.categoria === nome && !p.happy_hour))
        : [...new Set(pratos.filter(p => !p.happy_hour).map(p => p.categoria))];

    return (
        <div>
            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="hero-container" style={styles.hero}>
                <div style={styles.heroOverlay} />
                <div style={styles.heroContent}>
                    <img src="/logo.png" alt="Logo" className="hero-logo" style={styles.heroLogo} />
                    <p style={styles.heroLabel}>Comida Arretada & Cerveja Gelada</p>
                    <h1 className="hero-title" style={styles.heroTitle}>Boteco do Sivirino</h1>
                    <div className="hero-tags" style={styles.heroTags}>
                        <span className="hero-tag" style={styles.tag}>🍲 Refeições</span>
                        <span className="hero-tag" style={styles.tag}>🍟 Petiscos</span>
                        <span className="hero-tag" style={styles.tag}>🍕 Pizzas</span>
                        <span className="hero-tag" style={styles.tag}>🍺 Cerveja Gelada</span>
                        <span className="hero-tag" style={styles.tag}>🍹 Drinks</span>
                    </div>
                    <div className="hero-info" style={styles.heroInfo}>
                        <div style={styles.infoItem}>
                            <span>📍</span>
                            <span style={styles.infoText}>Rua Larga da Feitosa, 138 — Encruzilhada</span>
                        </div>
                        <div className="hero-info-sep" style={styles.infoSep} />
                        <div style={styles.infoItem}>
                            <span>📱</span>
                            <span style={styles.infoText}>(81) 98271-4421</span>
                        </div>
                        <div className="hero-info-sep" style={styles.infoSep} />
                        <div style={styles.infoItem}>
                            <span>📸</span>
                            <span style={styles.infoText}>@BOTECODO_SIVIRINO</span>
                        </div>
                    </div>
                    <div className="hero-btns" style={styles.heroBtns}>
                        <a href="#cardapio" className="hero-btn" style={styles.heroBtn}>Ver Cardápio</a>
                        {config.hh_ativo && happyHourPratos.length > 0 && (
                            <a href="#happy-hour" className="hero-btn" style={styles.heroBtnHH}>🍺 Happy Hour</a>
                        )}
                    </div>
                </div>
            </section>

            {loading && <div style={styles.center}><div style={styles.spinner} /></div>}
            {erro    && <div style={styles.erroBox}>⚠️ {erro}</div>}

            {!loading && !erro && (
                <>
                    {/* ── BOTÃO FLUTUANTE DE CATEGORIAS NO COMPUTADOR (HAMBURGUER DESKTOP) ── */}
                    <button
                        className="cat-desktop-btn"
                        onClick={() => setMenuCatAberto(true)}
                        title="Ver todas as categorias"
                    >
                        <span className="cat-desktop-icon">☰</span>
                        <span>Categorias</span>
                    </button>

                    {/* ── MENU LATERAL / DRAWER DE CATEGORIAS NO COMPUTADOR ── */}
                    {menuCatAberto && (
                        <div className="cat-drawer-overlay" onClick={() => setMenuCatAberto(false)}>
                            <div className="cat-drawer-panel" onClick={(e) => e.stopPropagation()}>
                                <div className="cat-drawer-header">
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                        <span style={{ fontSize: "1.5rem" }}>📂</span>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "1.15rem", fontFamily: "'Playfair Display', serif" }}>
                                                Categorias do Cardápio
                                            </h3>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                                                Navegue direto para a seção que desejar
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        className="cat-drawer-close"
                                        onClick={() => setMenuCatAberto(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="cat-drawer-list">
                                    {nomesCategoria.map((cat) => {
                                        const idAlvo = `cat-${cat.toLowerCase().replace(/\s+/g, '-')}`;
                                        return (
                                            <a
                                                key={cat}
                                                href={`#${idAlvo}`}
                                                className="cat-drawer-item"
                                                onClick={() => setMenuCatAberto(false)}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                                    <span style={{ fontSize: "1.3rem" }}>{getIconeCategoria(cat)}</span>
                                                    <span style={{ fontWeight: "600", fontSize: "0.92rem", color: "#222" }}>{cat}</span>
                                                </div>
                                                <span style={{ color: "#bbb", fontSize: "1.1rem", fontWeight: "700" }}>›</span>
                                            </a>
                                        );
                                    })}

                                    {config.hh_ativo && happyHourPratos.length > 0 && (
                                        <a
                                            href="#happy-hour"
                                            className="cat-drawer-item cat-drawer-hh"
                                            onClick={() => setMenuCatAberto(false)}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                                                <span style={{ fontSize: "1.3rem" }}>⚡</span>
                                                <span style={{ fontWeight: "700", fontSize: "0.92rem", color: "#b38210" }}>Happy Hour Especial</span>
                                            </div>
                                            <span style={{ color: "#e8b84b", fontSize: "1.1rem", fontWeight: "700" }}>›</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── BARRA FIXA DE NAVEGAÇÃO RÁPIDA POR CATEGORIA (EXCLUSIVA MOBILE) ── */}
                    <div className="cat-nav-bar" style={styles.catNavBar}>
                        <div style={styles.catNavContainer}>
                            {nomesCategoria.map((cat) => {
                                const idAlvo = `cat-${cat.toLowerCase().replace(/\s+/g, '-')}`;
                                return (
                                    <a
                                        key={cat}
                                        href={`#${idAlvo}`}
                                        className="cat-nav-item"
                                        style={styles.catNavItem}
                                    >
                                        <span style={{ fontSize: "1.1rem" }}>{getIconeCategoria(cat)}</span>
                                        <span>{cat}</span>
                                    </a>
                                );
                            })}

                            {config.hh_ativo && happyHourPratos.length > 0 && (
                                <a
                                    href="#happy-hour"
                                    className="cat-nav-item"
                                    style={{ ...styles.catNavItem, border: "1px solid #e8b84b", background: "rgba(232,184,75,0.1)", color: "#b38210" }}
                                >
                                    <span>⚡</span>
                                    <span>Happy Hour</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div id="cardapio">
                        {/* ── SEÇÕES POR CATEGORIA ─────────────────────── */}
                        {nomesCategoria.map((cat) => {
                            const pratosDaCat = pratos.filter(p => p.categoria === cat && !p.happy_hour);
                            if (pratosDaCat.length === 0) return null;
                            return (
                                <section key={cat} id={`cat-${cat.toLowerCase().replace(/\s+/g, '-')}`} className="menu-section" style={styles.section}>
                                    <div style={styles.sectionHeader}>
                                        <p style={styles.sectionLabel}>{getIconeCategoria(cat)} {cat}</p>
                                        <h2 style={styles.sectionTitle}>{cat}</h2>
                                        <div style={styles.sectionDivider} />
                                    </div>
                                    <div className="menu-grid" style={styles.grid}>
                                        {pratosDaCat.map(p => {
                                            const itemNoCarrinho = carrinho.find(c => c.id === p.id);
                                            return (
                                                <PratoCard
                                                    key={p.id}
                                                    prato={p}
                                                    onAdicionar={adicionarAoCarrinho}
                                                    qtdNoCarrinho={itemNoCarrinho?.quantidade || 0}
                                                />
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {/* ── HAPPY HOUR ───────────────────────────────── */}
                    {config.hh_ativo && happyHourPratos.length > 0 && (
                        <section id="happy-hour" className="hh-section" style={styles.happyHourSection}>
                            <div style={styles.hhOverlay} />
                            <div style={styles.hhContent}>
                                <div style={styles.hhHeader}>
                                    <p style={styles.hhLabel}>⚡ Promoções Especiais</p>
                                    <h2 style={styles.hhTitle}>Happy Hour</h2>
                                    <div style={styles.hhBadgeHorario}>
                                        <span>📅 {config.hh_dias}</span>
                                        <span style={{ opacity: 0.5 }}>•</span>
                                        <span>⏰ Das {config.hh_inicio} às {config.hh_fim}</span>
                                    </div>
                                    <p style={styles.hhSub}>
                                        Preços e descontos exclusivos para você curtir a noite no Boteco!
                                    </p>
                                    <div style={{ ...styles.sectionDivider, background: "linear-gradient(90deg, #f0c040, #e8b84b)" }} />
                                </div>
                                <div className="hh-grid" style={styles.hhGrid}>
                                    {happyHourPratos.map(p => {
                                        const itemNoCarrinho = carrinho.find(c => c.id === p.id);
                                        return (
                                            <PratoCard
                                                key={p.id}
                                                prato={p}
                                                happyHour
                                                onAdicionar={adicionarAoCarrinho}
                                                qtdNoCarrinho={itemNoCarrinho?.quantidade || 0}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── BARRA FLUTUANTE DO CARRINHO (WHATSAPP) ── */}
                    {totalItens > 0 && (
                        <div
                            className="cart-floating-bar"
                            onClick={() => setModalCarrinho(true)}
                            title="Ver pedido e enviar pelo WhatsApp"
                        >
                            <span className="cart-floating-badge">{totalItens}</span>
                            <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.1" }}>
                                <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>Ver Pedido</span>
                                <strong style={{ fontSize: "0.95rem" }}>R$ {totalCarrinho.toFixed(2).replace(".", ",")}</strong>
                            </div>
                            <span style={{ fontSize: "1.3rem", marginLeft: "4px" }}>💬</span>
                        </div>
                    )}

                    {/* ── MODAL DE FINALIZAÇÃO DE PEDIDO VIA WHATSAPP ── */}
                    {modalCarrinho && (
                        <div className="cart-modal-overlay" onClick={() => setModalCarrinho(false)}>
                            <div className="cart-modal-box" onClick={(e) => e.stopPropagation()}>
                                <div className="cart-modal-header">
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                        <span style={{ fontSize: "1.5rem" }}>🛒</span>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "'Playfair Display', serif" }}>
                                                Seu Pedido
                                            </h3>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#25d366" }}>
                                                Enviar direto para o WhatsApp do Boteco
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        style={{ background: "none", border: "none", color: "#aaa", fontSize: "1.3rem", cursor: "pointer" }}
                                        onClick={() => setModalCarrinho(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ padding: "1.2rem 1.5rem", flex: 1, overflowY: "auto" }}>
                                    {/* Lista de itens no carrinho */}
                                    <div style={{ marginBottom: "1.5rem" }}>
                                        <h4 style={{ fontSize: "0.9rem", color: "#777", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.6rem" }}>
                                            Itens Selecionados ({totalItens})
                                        </h4>
                                        {carrinho.map(item => (
                                            <div key={item.id} className="cart-item-row">
                                                <div style={{ flex: 1, paddingRight: "0.8rem" }}>
                                                    <p style={{ margin: 0, fontWeight: "600", fontSize: "0.92rem" }}>{item.nome}</p>
                                                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>
                                                        R$ {parseFloat(item.preco).toFixed(2).replace(".", ",")} un.
                                                    </p>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                    <button type="button" className="cart-qtd-btn" onClick={() => alterarQtd(item.id, -1)}>-</button>
                                                    <span style={{ fontWeight: "700", minWidth: "18px", textAlign: "center" }}>{item.quantidade}</span>
                                                    <button type="button" className="cart-qtd-btn" onClick={() => alterarQtd(item.id, 1)}>+</button>
                                                </div>

                                                <span style={{ fontWeight: "700", marginLeft: "1rem", minWidth: "75px", textAlign: "right" }}>
                                                    R$ {(parseFloat(item.preco) * item.quantidade).toFixed(2).replace(".", ",")}
                                                </span>
                                            </div>
                                        ))}

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "0.8rem", borderTop: "2px dashed #eee" }}>
                                            <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>Total:</span>
                                            <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "#128c7e" }}>
                                                R$ {totalCarrinho.toFixed(2).replace(".", ",")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Formulário de Identificação do Cliente */}
                                    <form onSubmit={enviarPedidoWhatsApp}>
                                        <div style={{ marginBottom: "1rem" }}>
                                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#444", marginBottom: "0.4rem" }}>
                                                Onde você está?
                                            </label>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setTipoEntrega("mesa")}
                                                    style={{
                                                        padding: "0.6rem",
                                                        borderRadius: "10px",
                                                        border: tipoEntrega === "mesa" ? "2px solid #25d366" : "1px solid #ddd",
                                                        background: tipoEntrega === "mesa" ? "#f0fdf4" : "#fafafa",
                                                        fontWeight: "700",
                                                        color: tipoEntrega === "mesa" ? "#166534" : "#666",
                                                        cursor: "pointer",
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    🍻 No Salão / Mesa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setTipoEntrega("delivery")}
                                                    style={{
                                                        padding: "0.6rem",
                                                        borderRadius: "10px",
                                                        border: tipoEntrega === "delivery" ? "2px solid #25d366" : "1px solid #ddd",
                                                        background: tipoEntrega === "delivery" ? "#f0fdf4" : "#fafafa",
                                                        fontWeight: "700",
                                                        color: tipoEntrega === "delivery" ? "#166534" : "#666",
                                                        cursor: "pointer",
                                                        fontSize: "0.85rem"
                                                    }}
                                                >
                                                    🛵 Delivery / Entrega
                                                </button>
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "0.8rem" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#555", marginBottom: "0.3rem" }}>
                                                    Seu Nome *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Ex: Carlos"
                                                    value={dadosCliente.nome}
                                                    onChange={(e) => setDadosCliente(d => ({ ...d, nome: e.target.value }))}
                                                    style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.88rem" }}
                                                />
                                            </div>

                                            {tipoEntrega === "mesa" ? (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#555", marginBottom: "0.3rem" }}>
                                                        Nº da Mesa *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Ex: Mesa 04"
                                                        value={dadosCliente.mesa}
                                                        onChange={(e) => setDadosCliente(d => ({ ...d, mesa: e.target.value }))}
                                                        style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.88rem" }}
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#555", marginBottom: "0.3rem" }}>
                                                        Endereço de Entrega *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Rua, número e bairro"
                                                        value={dadosCliente.endereco}
                                                        onChange={(e) => setDadosCliente(d => ({ ...d, endereco: e.target.value }))}
                                                        style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.88rem" }}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ marginBottom: "0.8rem" }}>
                                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#555", marginBottom: "0.3rem" }}>
                                                Forma de Pagamento
                                            </label>
                                            <select
                                                value={dadosCliente.pagamento}
                                                onChange={(e) => setDadosCliente(d => ({ ...d, pagamento: e.target.value }))}
                                                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.88rem", background: "#fff" }}
                                            >
                                                <option value="Cartão de Crédito / Débito">Cartão de Crédito / Débito</option>
                                                <option value="PIX">PIX</option>
                                                <option value="Dinheiro">Dinheiro</option>
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: "1.2rem" }}>
                                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#555", marginBottom: "0.3rem" }}>
                                                Observações (sem cebola, gelo e limão, etc.)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Opcional"
                                                value={dadosCliente.observacao}
                                                onChange={(e) => setDadosCliente(d => ({ ...d, observacao: e.target.value }))}
                                                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "0.88rem" }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                width: "100%",
                                                background: "#25d366",
                                                color: "#ffffff",
                                                border: "none",
                                                padding: "0.95rem",
                                                borderRadius: "50px",
                                                fontWeight: "800",
                                                fontSize: "1.05rem",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                boxShadow: "0 6px 20px rgba(37, 211, 102, 0.4)"
                                            }}
                                        >
                                            <span>Enviar Pedido para WhatsApp</span>
                                            <span>💬</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── RODAPÉ ─────────────────────────────────────── */}
            <footer className="footer-container" style={styles.footer}>
                <img src="/logo.png" alt="Logo" style={styles.footerLogo} />
                <p style={styles.footerNome}>Boteco do Sivirino</p>
                <p style={styles.footerSlogan}>Comida Arretada & Cerveja Gelada</p>
                <div className="footer-infos" style={styles.footerInfos}>
                    <span>📍 Rua Larga da Feitosa, 138 — Encruzilhada, Recife</span>
                    <span className="footer-sep" style={{ color: "#333" }}>|</span>
                    <span>📱 WhatsApp: (81) 98271-4421</span>
                    <span className="footer-sep" style={{ color: "#333" }}>|</span>
                    <span>📸 @BOTECODO_SIVIRINO</span>
                    <span className="footer-sep" style={{ color: "#333" }}>|</span>
                    <span>🛵 Disponível no iFood</span>
                </div>
                <p style={styles.footerCopy}>© {new Date().getFullYear()} Boteco do Sivirino — Todos os direitos reservados</p>
            </footer>
        </div>
    );
}

function PratoCard({ prato, happyHour, onAdicionar, qtdNoCarrinho }) {
    const [hovered, setHovered] = useState(false);

    const handleClick = () => {
        if (prato.id) {
            api.post(`/pratos/${prato.id}/visualizacao`).catch(() => {});
        }
    };

    const isEstrela = prato.classificacao === "estrela";
    const isEnigma = prato.classificacao === "enigma";

    return (
        <div
            style={{
                ...styles.card,
                ...(hovered ? styles.cardHover : {}),
                ...(happyHour ? styles.cardHH : {}),
                ...(isEstrela ? styles.cardEstrela : {}),
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
        >
            {prato.imagem ? (
                <div style={styles.cardImgBox}>
                    <img src={`${API_URL}${prato.imagem}`} alt={prato.nome} style={styles.cardImg} />
                    {prato.selo ? (
                        <div style={styles.seloBadge}>{prato.selo}</div>
                    ) : isEstrela ? (
                        <div style={styles.seloBadge}>🔥 Mais Pedido</div>
                    ) : happyHour ? (
                        <div style={styles.hhBadge}>🍺 Happy Hour</div>
                    ) : null}
                </div>
            ) : (
                <div style={{ ...styles.cardEmoji, ...(happyHour ? styles.cardEmojiHH : isEstrela ? styles.cardEmojiEstrela : {}) }}>
                    {getEmoji(prato.nome)}
                    {prato.selo ? (
                        <div style={styles.seloBadgeEmoji}>{prato.selo}</div>
                    ) : isEstrela ? (
                        <div style={styles.seloBadgeEmoji}>🔥 Mais Pedido</div>
                    ) : happyHour ? (
                        <div style={styles.hhBadgeEmoji}>🍺 Happy Hour</div>
                    ) : null}
                </div>
            )}

            <div style={styles.cardBody}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <h3 style={{ ...styles.cardNome, ...(happyHour ? styles.cardNomeHH : isEstrela ? styles.cardNomeEstrela : {}) }}>
                        {prato.nome}
                    </h3>
                </div>
                {prato.descricao && <p style={styles.cardDesc}>{prato.descricao}</p>}
            </div>

            <div style={{ ...styles.cardFooter, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ ...styles.cardPreco, ...(happyHour ? styles.cardPrecoHH : isEstrela ? styles.cardPrecoEstrela : {}) }}>
                    R$ {parseFloat(prato.preco).toFixed(2).replace(".", ",")}
                </span>

                <button
                    type="button"
                    className="btn-adicionar-prato"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdicionar?.(prato);
                    }}
                    title="Adicionar ao pedido via WhatsApp"
                >
                    <span>+</span>
                    <span>{qtdNoCarrinho > 0 ? `(${qtdNoCarrinho})` : "Pedir"}</span>
                </button>
            </div>
        </div>
    );
}

const styles = {
    hero: { position: "relative", minHeight: "560px", background: "linear-gradient(160deg, #0a0a0a 0%, #1a0e05 55%, #0d0803 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "3rem 1.5rem" },
    heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(232,184,75,0.07) 0%, transparent 65%)" },
    heroContent: { textAlign: "center", zIndex: 1, maxWidth: "700px", width: "100%" },
    heroLogo: { width: "90px", height: "90px", objectFit: "cover", borderRadius: "50%", border: "3px solid #e8b84b", marginBottom: "1rem", boxShadow: "0 0 30px rgba(232,184,75,0.2)" },
    heroLabel: { color: "#e8b84b", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" },
    heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.4rem, 5vw, 4.2rem)", fontWeight: "700", color: "#ffffff", lineHeight: "1.15", marginBottom: "1.5rem" },
    heroTags: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.6rem", marginBottom: "1.8rem" },
    tag: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "#ddd", padding: "0.4rem 0.9rem", borderRadius: "50px", fontSize: "0.82rem" },
    heroInfo: { display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "0.8rem", marginBottom: "2rem" },
    infoItem: { display: "flex", alignItems: "center", gap: "0.4rem" },
    infoText: { color: "#aaa", fontSize: "0.85rem" },
    infoSep: { width: "1px", height: "16px", background: "#444" },
    heroBtns: { display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" },
    heroBtn: { display: "inline-block", background: "#e8b84b", color: "#111", padding: "0.8rem 1.8rem", borderRadius: "50px", fontWeight: "700", fontSize: "0.9rem" },
    heroBtnHH: { display: "inline-block", background: "transparent", border: "2px solid #e8b84b", color: "#e8b84b", padding: "0.8rem 1.8rem", borderRadius: "50px", fontWeight: "700", fontSize: "0.9rem" },

    /* ── BARRA FIXA DE NAVEGAÇÃO DE CATEGORIAS (STICKY) ── */
    catNavBar: {
        position: "sticky",
        top: "70px",
        zIndex: 90,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e8e0d5",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        overflowX: "auto",
        whiteSpace: "nowrap",
        WebkitOverflowScrolling: "touch",
    },
    catNavContainer: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0.75rem 1.2rem",
        display: "flex",
        gap: "0.6rem",
        alignItems: "center"
    },
    catNavItem: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "#faf8f5",
        border: "1px solid #e0d9d0",
        color: "#333",
        padding: "0.45rem 1rem",
        borderRadius: "50px",
        fontSize: "0.85rem",
        fontWeight: "600",
        transition: "all 0.2s ease",
        textDecoration: "none",
        flexShrink: 0
    },

    section: { maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem" },
    sectionHeader: { textAlign: "center", marginBottom: "3rem" },
    sectionLabel: { color: "#e8b84b", fontSize: "0.78rem", fontWeight: "600", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" },
    sectionTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: "700", color: "#1a1a1a", marginBottom: "1rem" },
    sectionDivider: { width: "60px", height: "3px", background: "linear-gradient(90deg, #e8b84b, #c0392b)", margin: "0 auto", borderRadius: "2px" },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.8rem" },

    /* ── HAPPY HOUR SECTION ── */
    happyHourSection: { position: "relative", background: "linear-gradient(135deg, #0d0903 0%, #1a1000 50%, #0d0903 100%)", padding: "5rem 1.5rem", overflow: "hidden" },
    hhOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(232,184,75,0.06) 0%, transparent 70%)" },
    hhContent: { position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto" },
    hhHeader: { textAlign: "center", marginBottom: "3rem" },
    hhLabel: { color: "#e8b84b", fontSize: "0.8rem", fontWeight: "700", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "0.6rem" },
    hhTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "700", color: "#ffffff", marginBottom: "0.8rem" },
    hhBadgeHorario: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.8rem",
        flexWrap: "wrap",
        background: "rgba(232, 184, 75, 0.12)",
        border: "1px solid #e8b84b",
        color: "#e8b84b",
        padding: "0.5rem 1.4rem",
        borderRadius: "50px",
        fontSize: "0.95rem",
        fontWeight: "600",
        marginBottom: "1rem"
    },
    hhSub: { color: "#888", fontSize: "1rem", marginBottom: "1rem" },
    hhGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" },

    /* ── CARD ── */
    card: { background: "#ffffff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", transition: "transform 0.25s ease, box-shadow 0.25s ease", cursor: "pointer" },
    cardHover: { transform: "translateY(-4px)", boxShadow: "0 10px 24px rgba(0,0,0,0.1)" },
    cardHH: { background: "#1a1200", border: "1px solid rgba(232,184,75,0.2)" },
    cardEstrela: { border: "2px solid #e8b84b", boxShadow: "0 4px 20px rgba(232, 184, 75, 0.15)" },

    cardImgBox: { width: "100%", height: "200px", overflow: "hidden", position: "relative" },
    cardImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    hhBadge: { position: "absolute", top: "10px", left: "10px", background: "#e8b84b", color: "#111", padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" },
    seloBadge: { position: "absolute", top: "10px", left: "10px", background: "linear-gradient(135deg, #e8b84b, #d49b28)", color: "#111", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "800", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },

    cardEmoji: { background: "linear-gradient(135deg, #fff8e7, #fcefc7)", textAlign: "center", fontSize: "3rem", padding: "1.8rem 1rem 1.4rem", position: "relative" },
    cardEmojiHH: { background: "linear-gradient(135deg, #1e1600, #2a1e00)" },
    cardEmojiEstrela: { background: "linear-gradient(135deg, #fffcf5, #fef5dc)" },
    hhBadgeEmoji: { position: "absolute", top: "10px", left: "10px", background: "#e8b84b", color: "#111", padding: "0.25rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" },
    seloBadgeEmoji: { position: "absolute", top: "10px", left: "10px", background: "linear-gradient(135deg, #e8b84b, #d49b28)", color: "#111", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "800", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },

    cardBody: { padding: "1.2rem 1.4rem", flex: 1 },
    cardNome: { fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.4rem" },
    cardNomeHH: { color: "#e8b84b" },
    cardNomeEstrela: { color: "#111" },
    cardDesc: { fontSize: "0.84rem", color: "#999", lineHeight: "1.6" },
    cardFooter: { padding: "0.9rem 1.4rem", borderTop: "1px solid #f0ebe3", display: "flex", justifyContent: "flex-end" },
    cardPreco: { background: "linear-gradient(135deg, #c0392b, #96281b)", color: "#fff", padding: "0.4rem 1.1rem", borderRadius: "50px", fontSize: "0.95rem", fontWeight: "700" },
    cardPrecoEstrela: { background: "linear-gradient(135deg, #e8b84b, #c49020)", color: "#111" },
    cardPrecoHH: { background: "linear-gradient(135deg, #e8b84b, #c99a30)", color: "#111" },

    center: { textAlign: "center", padding: "4rem 0" },
    spinner: { width: "36px", height: "36px", border: "3px solid #f0ebe3", borderTop: "3px solid #e8b84b", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" },
    erroBox: { background: "#fdecea", color: "#c0392b", padding: "1rem 1.5rem", borderRadius: "10px", textAlign: "center", fontSize: "0.9rem", margin: "2rem auto", maxWidth: "600px" },

    footer: { background: "#111111", textAlign: "center", padding: "3rem 1.5rem" },
    footerLogo: { width: "52px", height: "52px", objectFit: "cover", borderRadius: "50%", border: "2px solid #e8b84b", marginBottom: "0.8rem" },
    footerNome: { fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#e8b84b", fontWeight: "700" },
    footerSlogan: { color: "#666", fontSize: "0.75rem", letterSpacing: "2px", textTransform: "uppercase", margin: "0.3rem 0 1.2rem" },
    footerInfos: { display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "0.8rem", color: "#666", fontSize: "0.82rem", marginBottom: "1.5rem" },
    footerCopy: { color: "#444", fontSize: "0.78rem" },
};
