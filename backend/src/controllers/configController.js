// ============================================================
// backend/src/controllers/configController.js
// ============================================================

const db = require("../config/database");

// Função auxiliar de normalização de texto (remove acentos, espaços extras e caixa baixa)
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// GET /config — público (usado no cardápio / home)
const obterConfig = (req, res) => {
    db.query("SELECT * FROM configuracao WHERE id = 1", (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        if (resultado.length === 0) {
            return res.json({
                hh_ativo: 1,
                hh_dias: "Segunda, Terça e Quarta",
                hh_inicio: "19:00",
                hh_fim: "22:00",
                delivery_ativo: 1,
                delivery_tempo: "40 a 60 min",
                delivery_taxa_padrao: 8.00,
                delivery_pedido_minimo: 0.00
            });
        }
        res.json(resultado[0]);
    });
};

// PUT /config/happy-hour — admin
const atualizarHappyHour = (req, res) => {
    const { hh_ativo, hh_dias, hh_inicio, hh_fim } = req.body;

    const ativo = (hh_ativo === true || hh_ativo === "true" || hh_ativo === 1 || hh_ativo === "1") ? 1 : 0;
    const dias = hh_dias || "Segunda, Terça e Quarta";
    const inicio = hh_inicio || "19:00";
    const fim = hh_fim || "22:00";

    const sql = `
        INSERT INTO configuracao (id, hh_ativo, hh_dias, hh_inicio, hh_fim)
        VALUES (1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            hh_ativo = VALUES(hh_ativo),
            hh_dias = VALUES(hh_dias),
            hh_inicio = VALUES(hh_inicio),
            hh_fim = VALUES(hh_fim)
    `;

    db.query(sql, [ativo, dias, inicio, fim], (erro) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({
            mensagem: "Configurações de Happy Hour atualizadas com sucesso!",
            config: { hh_ativo: ativo, hh_dias: dias, hh_inicio: inicio, hh_fim: fim }
        });
    });
};

// PUT /config/delivery — admin
const atualizarDeliveryConfig = (req, res) => {
    const {
        delivery_ativo,
        delivery_tempo,
        delivery_taxa_padrao,
        delivery_pedido_minimo,
        delivery_modo,
        delivery_taxa_km,
        delivery_taxa_base,
        delivery_raio_maximo
    } = req.body;

    const ativo = (delivery_ativo === true || delivery_ativo === "true" || delivery_ativo === 1 || delivery_ativo === "1") ? 1 : 0;
    const tempo = delivery_tempo || "40 a 60 min";
    const taxaPadrao = parseFloat(delivery_taxa_padrao) || 8.00;
    const pedidoMinimo = parseFloat(delivery_pedido_minimo) || 0.00;
    const modo = delivery_modo || "km";
    const taxaKm = parseFloat(delivery_taxa_km) || 2.00;
    const taxaBase = parseFloat(delivery_taxa_base) || 6.00;
    const raioMax = parseFloat(delivery_raio_maximo) || 12.00;

    const sql = `
        INSERT INTO configuracao (
            id, delivery_ativo, delivery_tempo, delivery_taxa_padrao, delivery_pedido_minimo,
            delivery_modo, delivery_taxa_km, delivery_taxa_base, delivery_raio_maximo
        )
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            delivery_ativo = VALUES(delivery_ativo),
            delivery_tempo = VALUES(delivery_tempo),
            delivery_taxa_padrao = VALUES(delivery_taxa_padrao),
            delivery_pedido_minimo = VALUES(delivery_pedido_minimo),
            delivery_modo = VALUES(delivery_modo),
            delivery_taxa_km = VALUES(delivery_taxa_km),
            delivery_taxa_base = VALUES(delivery_taxa_base),
            delivery_raio_maximo = VALUES(delivery_raio_maximo)
    `;

    db.query(sql, [ativo, tempo, taxaPadrao, pedidoMinimo, modo, taxaKm, taxaBase, raioMax], (erro) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({
            mensagem: "Configurações de Delivery atualizadas com sucesso!",
            config: {
                delivery_ativo: ativo,
                delivery_tempo: tempo,
                delivery_taxa_padrao: taxaPadrao,
                delivery_pedido_minimo: pedidoMinimo,
                delivery_modo: modo,
                delivery_taxa_km: taxaKm,
                delivery_taxa_base: taxaBase,
                delivery_raio_maximo: raioMax
            }
        });
    });
};

// GET /config/delivery/bairros — público
const listarBairrosDelivery = (req, res) => {
    db.query("SELECT * FROM delivery_bairro WHERE ativo = 1 ORDER BY nome ASC", (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultados);
    });
};

// GET /config/delivery/bairros/admin — lista todos (inclusive inativos) para o admin
const listarTodosBairrosAdmin = (req, res) => {
    db.query("SELECT * FROM delivery_bairro ORDER BY nome ASC", (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json(resultados);
    });
};

// POST /config/delivery/bairros — admin: adicionar ou atualizar bairro
const salvarBairroDelivery = (req, res) => {
    const { id, nome, taxa, tempo_estimado, ativo } = req.body;
    if (!nome) return res.status(400).json({ erro: "Nome do bairro é obrigatório." });

    const norm = normalizarTexto(nome);
    const taxaNum = parseFloat(taxa) || 8.00;
    const tempo = tempo_estimado || "40 a 55 min";
    const statusAtivo = (ativo === false || ativo === "false" || ativo === 0 || ativo === "0") ? 0 : 1;

    if (id) {
        db.query(
            "UPDATE delivery_bairro SET nome = ?, nome_normalizado = ?, taxa = ?, tempo_estimado = ?, ativo = ? WHERE id = ?",
            [nome.trim(), norm, taxaNum, tempo, statusAtivo, id],
            (erro) => {
                if (erro) return res.status(500).json({ erro: erro.message });
                res.json({ mensagem: "Bairro atualizado com sucesso!" });
            }
        );
    } else {
        db.query(
            `INSERT INTO delivery_bairro (nome, nome_normalizado, taxa, tempo_estimado, ativo)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                taxa = VALUES(taxa),
                tempo_estimado = VALUES(tempo_estimado),
                ativo = VALUES(ativo)`,
            [nome.trim(), norm, taxaNum, tempo, statusAtivo],
            (erro, resultado) => {
                if (erro) return res.status(500).json({ erro: erro.message });
                res.status(201).json({ mensagem: "Bairro cadastrado com sucesso!", id: resultado.insertId });
            }
        );
    }
};

// DELETE /config/delivery/bairros/:id — admin
const excluirBairroDelivery = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM delivery_bairro WHERE id = ?", [id], (erro) => {
        if (erro) return res.status(500).json({ erro: erro.message });
        res.json({ mensagem: "Bairro removido com sucesso!" });
    });
};

// POST /config/delivery/calcular — público: cálculo flexível por KM ou Bairro
const calcularFreteDelivery = (req, res) => {
    const { bairro, cep, distancia_km } = req.body;
    const bairroBuscado = normalizarTexto(bairro);

    db.query("SELECT * FROM configuracao WHERE id = 1", (errConfig, rConfig) => {
        const config = rConfig && rConfig.length > 0 ? rConfig[0] : {
            delivery_ativo: 1,
            delivery_taxa_padrao: 8.00,
            delivery_modo: "km",
            delivery_taxa_base: 6.00,
            delivery_taxa_km: 2.00,
            delivery_raio_maximo: 12.00
        };

        if (!config.delivery_ativo) {
            return res.json({
                atendido: false,
                motivo: "delivery_inativo",
                mensagem: "No momento, nosso serviço de entregas está pausado. Você pode retirar no balcão ou pedir no salão!"
            });
        }

        const taxaPadrao = parseFloat(config.delivery_taxa_padrao) || 8.00;
        const taxaBase = parseFloat(config.delivery_taxa_base) || 6.00;
        const taxaPorKm = parseFloat(config.delivery_taxa_km) || 2.00;
        const raioMax = parseFloat(config.delivery_raio_maximo) || 12.00;

        // Se o frontend calculou a distância em KM a partir das coordenadas
        if (distancia_km !== undefined && distancia_km !== null && !isNaN(distancia_km)) {
            const dist = parseFloat(distancia_km);

            if (dist > raioMax) {
                // Fora do raio máximo configurado pelo admin
                return res.json({
                    atendido: false,
                    motivo: "fora_raio",
                    distancia: dist,
                    mensagem: `O endereço está a ~${dist.toFixed(1)} km do Boteco. Nosso raio de entrega é de até ${raioMax} km.`
                });
            }

            // Cálculo por KM: Taxa Base + (KM * Valor/KM)
            // Ex: até 2 km cobra a taxa base, depois soma por km
            let taxaCalculada = taxaBase;
            if (dist > 2) {
                taxaCalculada = taxaBase + ((dist - 2) * taxaPorKm);
            }
            taxaCalculada = Math.round(taxaCalculada * 2) / 2; // Arredonda para múltiplos de 0.50

            return res.json({
                atendido: true,
                modo: "km",
                distancia_km: dist,
                taxa: taxaCalculada,
                tempo_estimado: config.delivery_tempo || "40 a 60 min",
                bairro: bairro || "Seu Endereço",
                pedido_minimo: parseFloat(config.delivery_pedido_minimo) || 0
            });
        }

        // Se não tem KM, busca na tabela de bairros ou usa a Taxa Padrão (NUNCA BLOQUEIA)
        db.query("SELECT * FROM delivery_bairro WHERE ativo = 1", (errBairros, bairros) => {
            if (errBairros) return res.status(500).json({ erro: errBairros.message });

            let encontrado = null;
            if (bairroBuscado) {
                encontrado = bairros.find(b => b.nome_normalizado === bairroBuscado);
                if (!encontrado) {
                    encontrado = bairros.find(b => 
                        b.nome_normalizado.includes(bairroBuscado) || 
                        bairroBuscado.includes(b.nome_normalizado)
                    );
                }
            }

            if (encontrado) {
                return res.json({
                    atendido: true,
                    modo: "bairro_tabelado",
                    bairro: encontrado.nome,
                    taxa: parseFloat(encontrado.taxa),
                    tempo_estimado: encontrado.tempo_estimado || config.delivery_tempo,
                    pedido_minimo: parseFloat(config.delivery_pedido_minimo) || 0
                });
            }

            // OPÇÃO 1 ATIVADA: Bairro não tabelado recebe a Taxa Padrão sem travar o cliente!
            return res.json({
                atendido: true,
                modo: "taxa_padrao",
                bairro: bairro || "Outro Bairro",
                taxa: taxaPadrao,
                tempo_estimado: config.delivery_tempo || "40 a 60 min",
                aviso: `Taxa Padrão de R$ ${taxaPadrao.toFixed(2).replace(".", ",")} aplicada para o bairro ${bairro || ""}. O Boteco confirmará pelo WhatsApp.`,
                pedido_minimo: parseFloat(config.delivery_pedido_minimo) || 0
            });
        });
    });
};

module.exports = {
    obterConfig,
    atualizarHappyHour,
    atualizarDeliveryConfig,
    listarBairrosDelivery,
    listarTodosBairrosAdmin,
    salvarBairroDelivery,
    excluirBairroDelivery,
    calcularFreteDelivery
};
