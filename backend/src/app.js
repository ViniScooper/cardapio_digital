// ============================================================
// backend/src/app.js
// ============================================================

const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const authRoutes      = require("./routes/authRoutes");
const pratoRoutes     = require("./routes/pratoRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");
const configRoutes    = require("./routes/configRoutes");
const seloRoutes      = require("./routes/seloRoutes");

const app = express();

// Configuração flexível de CORS: aceita localhost, redes locais, Vercel e Hostinger
const origensPermitidas = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://boteco-do-sivirino.vercel.app",
];

app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem origin (como mobile apps, Postman ou curl)
        // e qualquer subdomínio da Vercel ou IP da rede local
        if (!origin || origensPermitidas.includes(origin) || origin.endsWith(".vercel.app") || origin.includes("192.168.") || origin.includes("10.0.")) {
            return callback(null, true);
        }
        return callback(null, true); // No modo teste/produção liberado para evitar bloqueios inesperados
    },
    credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth",       authRoutes);
app.use("/pratos",     pratoRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/config",     configRoutes);
app.use("/selos",      seloRoutes);

app.get("/", (req, res) => {
    res.json({ mensagem: "API do Boteco do Sivirino funcionando! 🍺" });
});

module.exports = app;
