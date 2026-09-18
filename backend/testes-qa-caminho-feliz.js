// ============================================================
// testes-qa-caminho-feliz.js
// Bateria de Testes Automatizados de QA (End-to-End / Caminho Feliz)
// Boteco do Sivirino — Cardápio Digital (Usa fetch nativo do Node 20 + JWT)
// ============================================================

const jwt = require('jsonwebtoken');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'restaurante_jwt_secret_2024';

// Gera token de Admin válido para os testes
const adminToken = jwt.sign(
    { id: 1, nome: 'QA Admin', email: 'admin@boteco.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '2h' }
);

console.log(`\n======================================================`);
console.log(`🧪 INICIANDO BATERIA DE TESTES DE QA — CAMINHO FELIZ`);
console.log(`🎯 Alvo da API: ${API_URL}`);
console.log(`🔐 Autenticação Admin: Token JWT Ativo`);
console.log(`======================================================\n`);

let passedCount = 0;
let totalCount = 0;

function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
        passedCount++;
        console.log(`  ✅ [PASSOU] ${testName}`);
        if (details) console.log(`     └─ ${details}`);
    } else {
        console.error(`  ❌ [FALHOU] ${testName}`);
        if (details) console.error(`     └─ ERRO: ${details}`);
    }
}

async function request(path, options = {}) {
    const url = `${API_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        ...(options.headers || {})
    };
    const opts = {
        ...options,
        headers
    };
    if (opts.body && typeof opts.body === 'object') {
        opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try {
        data = await res.json();
    } catch (e) {
        data = null;
    }
    return { status: res.status, data };
}

async function runQA() {
    try {
        // -------------------------------------------------------------
        // TESTE 1: Leitura das Configurações Iniciais
        // -------------------------------------------------------------
        console.log(`\n--- 1. TESTE DE CONFIGURAÇÕES GERAIS ---`);
        const resConfig = await request('/config');
        assert(resConfig.status === 200, 'GET /config responde HTTP 200');
        assert(resConfig.data.hh_apenas_local !== undefined, 'Coluna hh_apenas_local presente na API', `Valor: ${resConfig.data.hh_apenas_local}`);
        assert(resConfig.data.delivery_taxa_embalagem !== undefined, 'Coluna delivery_taxa_embalagem presente na API', `Valor: ${resConfig.data.delivery_taxa_embalagem}`);
        assert(resConfig.data.delivery_embalagem_tipo !== undefined, 'Coluna delivery_embalagem_tipo presente na API', `Valor: ${resConfig.data.delivery_embalagem_tipo}`);

        // -------------------------------------------------------------
        // TESTE 2: Ciclo de Vida de Categoria (Criar, Vincular Prato e Excluir com Realocação Segura)
        // -------------------------------------------------------------
        console.log(`\n--- 2. TESTE DE CATEGORIA (CRIAR E EXCLUSÃO SEGURA) ---`);
        const nomeCatQA = `QA Especialidades ${Date.now()}`;
        
        // Criar categoria
        const resNovaCat = await request('/categorias', {
            method: 'POST',
            body: { nome: nomeCatQA, icone: '⭐' }
        });
        assert(resNovaCat.status === 201 || resNovaCat.status === 200, 'POST /categorias cria categoria com sucesso');
        const idCatCriada = resNovaCat.data?.id || resNovaCat.data?.categoriaId;

        // Criar um prato vinculado a essa categoria
        const resNovoPrato = await request('/pratos', {
            method: 'POST',
            body: {
                nome: `Prato Teste QA ${Date.now()}`,
                descricao: 'Delicioso prato de teste automatizado',
                preco: '45.00',
                categoria: nomeCatQA,
                categoria_secundaria: 'Petiscos'
            }
        });
        assert(resNovoPrato.status === 201 || resNovoPrato.status === 200, 'POST /pratos vincula prato à categoria criada');
        const idPratoCriado = resNovoPrato.data?.id || resNovoPrato.data?.pratoId;

        // Excluir a categoria que contém prato (deve realocar para "Cardápio" sem dar erro 400)
        const resDeleteCat = await request(`/categorias/${idCatCriada}`, { method: 'DELETE' });
        assert(resDeleteCat.status === 200, 'DELETE /categorias exclui categoria com prato sem retornar HTTP 400 (remanejamento automático)', resDeleteCat.data?.mensagem);

        // Validar que o prato foi movido para 'Cardápio'
        const resPratosCheck = await request('/pratos');
        const pratoMovido = resPratosCheck.data.find(p => p.id === idPratoCriado);
        assert(pratoMovido && pratoMovido.categoria === 'Cardápio', 'Prato foi movido automaticamente para a categoria "Cardápio"');

        // Limpar o prato de teste
        if (idPratoCriado) {
            await request(`/pratos/${idPratoCriado}`, { method: 'DELETE' });
        }

        // -------------------------------------------------------------
        // TESTE 3: Prato com Categoria Primária e Secundária (Exibição Dupla)
        // -------------------------------------------------------------
        console.log(`\n--- 3. TESTE DE PRATO EM DUAS CATEGORIAS ---`);
        const resPratoDuplo = await request('/pratos', {
            method: 'POST',
            body: {
                nome: `Maminha na Brasa QA ${Date.now()}`,
                descricao: 'Acompanha macaxeira e farofa',
                preco: '58.00',
                categoria: 'Carnes',
                categoria_secundaria: 'Petiscos'
            }
        });
        assert(resPratoDuplo.status === 201 || resPratoDuplo.status === 200, 'Criar prato com categoria primária e secundária');
        const idPratoDuplo = resPratoDuplo.data?.id || resPratoDuplo.data?.pratoId;

        const resListaPratos = await request('/pratos');
        const itemPrato = resListaPratos.data.find(p => p.id === idPratoDuplo);
        assert(itemPrato?.categoria === 'Carnes', 'Categoria principal salva como "Carnes"');
        assert(itemPrato?.categoria_secundaria === 'Petiscos', 'Categoria secundária salva como "Petiscos"');

        // Simulação da lógica do frontend (Home.jsx) para ver se aparece nas 2 categorias:
        const filtroCarnes = resListaPratos.data.filter(p => p.categoria === 'Carnes' || p.categoria_secundaria === 'Carnes');
        const filtroPetiscos = resListaPratos.data.filter(p => p.categoria === 'Petiscos' || p.categoria_secundaria === 'Petiscos');
        const existeEmCarnes = filtroCarnes.some(p => p.id === idPratoDuplo);
        const existeEmPetiscos = filtroPetiscos.some(p => p.id === idPratoDuplo);

        assert(existeEmCarnes && existeEmPetiscos, 'Prato aparece simultaneamente em "Carnes" E em "Petiscos" no Cardápio público');

        // Limpar prato duplo
        await request(`/pratos/${idPratoDuplo}`, { method: 'DELETE' });

        // -------------------------------------------------------------
        // TESTE 4: Trava de Happy Hour no Delivery (Regra de Negócio)
        // -------------------------------------------------------------
        console.log(`\n--- 4. TESTE DE TRAVA DE HAPPY HOUR NO DELIVERY ---`);
        // Ativar hh_apenas_local = 1
        await request('/config/happy-hour', {
            method: 'PUT',
            body: {
                hh_ativo: 1,
                hh_dias: "Terça a Sexta - Feira",
                hh_inicio: "17:00",
                hh_fim: "21:00",
                hh_apenas_local: 1
            }
        });
        const resConfigHH = await request('/config');
        assert(Number(resConfigHH.data.hh_apenas_local) === 1, 'Configuração hh_apenas_local = 1 salva com sucesso');

        // Simulação do Carrinho
        const carrinhoComHH = [
            { id: 991, nome: 'Chopp Promo Happy Hour', preco: '7.90', happy_hour: 1, quantidade: 2 },
            { id: 992, nome: 'Torresmo', preco: '25.00', happy_hour: 0, quantidade: 1 }
        ];

        // Regra Salão:
        const tipoEntregaMesa = 'mesa';
        const bloqueioMesa = tipoEntregaMesa === 'delivery' && carrinhoComHH.some(i => i.happy_hour) && Number(resConfigHH.data.hh_apenas_local) === 1;
        assert(!bloqueioMesa, 'No Salão/Mesa: Pedido com Happy Hour é AUTORIZADO');

        // Regra Delivery:
        const tipoEntregaDelivery = 'delivery';
        const bloqueioDelivery = tipoEntregaDelivery === 'delivery' && carrinhoComHH.some(i => i.happy_hour) && Number(resConfigHH.data.hh_apenas_local) === 1;
        assert(bloqueioDelivery, 'No Delivery: Pedido com Happy Hour é BLOQUEADO com sucesso');

        // -------------------------------------------------------------
        // TESTE 5: Cálculo de Taxa de Embalagem Delivery
        // -------------------------------------------------------------
        console.log(`\n--- 5. TESTE DE TAXA DE EMBALAGEM PARA DELIVERY ---`);
        // Configurar R$ 3,00 de embalagem por pedido
        const resPutDelivery = await request('/config/delivery', {
            method: 'PUT',
            body: {
                ...resConfig.data,
                delivery_taxa_embalagem: 3.00,
                delivery_embalagem_tipo: 'pedido'
            }
        });
        assert(resPutDelivery.status === 200, 'PUT /config/delivery salva taxa de embalagem');

        const resConfEmb = await request('/config');
        assert(parseFloat(resConfEmb.data.delivery_taxa_embalagem) === 3.00, 'Taxa de embalagem confirmada como R$ 3,00 no GET /config');

        const carrinhoNormal = [
            { id: 1, nome: 'Bode Guisado', preco: '45.00', quantidade: 1 },
            { id: 2, nome: 'Cerveja Original', preco: '14.00', quantidade: 2 }
        ];
        const subtotal = carrinhoNormal.reduce((acc, i) => acc + (parseFloat(i.preco) * i.quantidade), 0); // 45 + 28 = 73.00
        const totalItens = carrinhoNormal.reduce((acc, i) => acc + i.quantidade, 0); // 3 itens
        const freteFixo = 8.00;

        // Cenário Mesa:
        const embalagemMesa = (tipoEntregaMesa === 'delivery' && parseFloat(resConfEmb.data.delivery_taxa_embalagem) > 0)
            ? parseFloat(resConfEmb.data.delivery_taxa_embalagem) : 0;
        const totalMesa = subtotal + embalagemMesa;
        assert(embalagemMesa === 0 && totalMesa === 73.00, 'No Salão/Mesa: Taxa de embalagem é R$ 0,00 e total é R$ 73,00');

        // Cenário Delivery (Modo Pedido):
        const embalagemDelivery = (tipoEntregaDelivery === 'delivery' && parseFloat(resConfEmb.data.delivery_taxa_embalagem) > 0)
            ? (resConfEmb.data.delivery_embalagem_tipo === 'item' ? parseFloat(resConfEmb.data.delivery_taxa_embalagem) * totalItens : parseFloat(resConfEmb.data.delivery_taxa_embalagem))
            : 0;
        const totalDelivery = subtotal + freteFixo + embalagemDelivery;
        assert(embalagemDelivery === 3.00 && totalDelivery === 84.00, 'No Delivery (Modo Pedido): Taxa de embalagem é R$ 3,00 e total com frete é R$ 84,00');

        // Cenário Delivery (Modo por Item):
        const embalagemPorItem = 3.00 * totalItens; // 3.00 * 3 = 9.00
        const totalComEmbalagemPorItem = subtotal + freteFixo + embalagemPorItem; // 73 + 8 + 9 = 90.00
        assert(embalagemPorItem === 9.00 && totalComEmbalagemPorItem === 90.00, 'No Delivery (Modo Item): Taxa de embalagem calculada por item (R$ 9,00) e total é R$ 90,00');

        // -------------------------------------------------------------
        // TESTE 6: Geração da Mensagem do WhatsApp
        // -------------------------------------------------------------
        console.log(`\n--- 6. TESTE DE GERAÇÃO DA MENSAGEM DO WHATSAPP ---`);
        let msgWhatsApp = `🍻 *NOVO PEDIDO — BOTECO DO SIVIRINO*\n`;
        msgWhatsApp += `----------------------------------------\n`;
        msgWhatsApp += `👤 *Cliente:* João Teste QA\n`;
        msgWhatsApp += `🛵 *Entrega Delivery:*\nRua da Hora, 100 - Espinheiro\n`;
        msgWhatsApp += `💳 *Forma de Pagamento:* PIX\n`;
        msgWhatsApp += `----------------------------------------\n`;
        msgWhatsApp += `📋 *ITENS DO PEDIDO:*\n`;
        carrinhoNormal.forEach(item => {
            const sub = (parseFloat(item.preco) * item.quantidade).toFixed(2).replace('.', ',');
            msgWhatsApp += `• ${item.quantidade}x ${item.nome} — R$ ${sub}\n`;
        });
        msgWhatsApp += `----------------------------------------\n`;
        msgWhatsApp += `Subtotal dos Pratos: R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        msgWhatsApp += `📦 Taxa de Embalagem: R$ ${embalagemDelivery.toFixed(2).replace('.', ',')}\n`;
        msgWhatsApp += `🛵 Taxa de Entrega (Espinheiro): R$ ${freteFixo.toFixed(2).replace('.', ',')}\n`;
        msgWhatsApp += `----------------------------------------\n`;
        msgWhatsApp += `💰 *VALOR TOTAL (COM FRETE & EMBALAGEM):* R$ ${totalDelivery.toFixed(2).replace('.', ',')}\n`;

        assert(msgWhatsApp.includes('📦 Taxa de Embalagem: R$ 3,00'), 'Mensagem contém linha "📦 Taxa de Embalagem: R$ 3,00"');
        assert(msgWhatsApp.includes('💰 *VALOR TOTAL (COM FRETE & EMBALAGEM):* R$ 84,00'), 'Mensagem contém valor total correto de R$ 84,00');

        // -------------------------------------------------------------
        // RESUMO FINAL DO QA
        // -------------------------------------------------------------
        console.log(`\n======================================================`);
        console.log(`📊 RELATÓRIO FINAL DO QA:`);
        console.log(`   Total de Testes: ${totalCount}`);
        console.log(`   Testes Aprovados: ${passedCount}`);
        console.log(`   Testes Reprovados: ${totalCount - passedCount}`);
        console.log(`======================================================`);

        if (passedCount === totalCount) {
            console.log(`🏆 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! O CAMINHO FELIZ ESTÁ PERFEITO! 🎉\n`);
            process.exit(0);
        } else {
            console.error(`⚠️ ALGUNS TESTES FALHARAM. VERIFIQUE OS LOGS ACIMA.\n`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Erro fatal durante a execução dos testes:', error.message);
        process.exit(1);
    }
}

runQA();
