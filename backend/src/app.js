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

app.use(cors()); // Permite acesso do frontend via localhost ou IP da rede local
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
