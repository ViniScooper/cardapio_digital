// ============================================================
// frontend/src/config/environment.js
// Configuração centralizada de ambientes (Vercel, Hostinger, Local, VPS)
// ============================================================

/**
 * MODO DE USO:
 * 1. Para trocar de ambiente, você pode simplesmente mudar a linha abaixo (PRODUÇÃO / VERCEL / LOCAL)
 *    OU definir a variável de ambiente VITE_API_URL no painel da sua hospedagem (Vercel / Hostinger / etc).
 */

// Se houver variável de ambiente no Vite/Vercel/Hostinger, ela tem prioridade total:
const ENV_API_URL = import.meta.env.VITE_API_URL;

// Caso não esteja configurado no painel da hospedagem, você pode escolher manualmente aqui:
const AMBIENTES = {
    // 1. Desenvolvimento local ou na mesma rede Wi-Fi pelo celular
    local: typeof window !== "undefined" ? `http://${window.location.hostname}:3001` : "http://localhost:3001",

    // 2. Sua VM Oracle Cloud (coloque o IP ou subdomínio da sua VM)
    // Ex: "http://129.148.x.x:3001" ou com SSL "https://api.seuboteco.com"
    oracle_vm: "http://129.148.25.100:3001",

    // 3. Túnel gratuito Cloudflare / Ngrok (para testes externos sem pagar domínio)
    // Ex: "https://boteco-api.trycloudflare.com"
    tunel_teste: "https://api-boteco.trycloudflare.com",

    // 4. Hostinger (caso use VPS ou subdomínio na Hostinger)
    hostinger: "https://api.botecodosivirino.com.br"
};

// 🎯 ALTERE AQUI CASO QUEIRA FORÇAR UM AMBIENTE ESPECÍFICO SEM USAR .ENV:
// Opções: "local" | "oracle_vm" | "tunel_teste" | "hostinger"
const AMBIENTE_ATIVO = "local";

// Exportação final da URL da API utilizada por todo o frontend
export const BASE_API_URL = ENV_API_URL || AMBIENTES[AMBIENTE_ATIVO] || AMBIENTES.local;

console.log(`[Cardápio Boteco] Conectado na API: ${BASE_API_URL}`);
