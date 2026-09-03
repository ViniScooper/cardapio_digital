// ============================================================
// backend/server.js — Ponto de entrada da aplicação
// ============================================================

require("dotenv").config(); // Carrega variáveis de ambiente do arquivo .env

const app = require("./src/app");
require("./src/config/database"); // inicia a conexão com o MySQL
const os = require("os");
const qrcodeTerminal = require("qrcode-terminal");

const PORT = process.env.PORT || 3001;

// Descobre o IP da rede local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

app.listen(PORT, "0.0.0.0", () => {
    const ip = getLocalIP();
    const frontendUrl = `http://${ip}:5173`;

    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    console.log(`📱 Acesso na rede local: http://${ip}:${PORT}`);
    console.log(`\n======================================================`);
    console.log(`📲 ESCANEIE O QR CODE PARA ACESSAR O CARDÁPIO NO CELULAR:`);
    console.log(`👉 Link: ${frontendUrl}`);
    console.log(`======================================================\n`);
    
    // Imprime o QR Code no terminal do backend
    qrcodeTerminal.generate(frontendUrl, { small: true });
});
