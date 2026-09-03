// ============================================================
// backend/src/routes/authRoutes.js — Rotas de autenticação
// ============================================================

const express = require("express");
const router  = express.Router();

const { registrar, login }       = require("../controllers/authController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");

// POST /auth/registrar → protegido! apenas admin logado pode criar novos usuários
// Para criar o primeiro admin, use direto no banco de dados (ver ROTAS_API.txt)
router.post("/registrar", verificarToken, apenasAdmin, registrar);

// POST /auth/login → público, retorna o token JWT
router.post("/login", login);

module.exports = router;
