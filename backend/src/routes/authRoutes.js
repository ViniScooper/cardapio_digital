// ============================================================
// backend/src/routes/authRoutes.js — Rotas de autenticação
// ============================================================

const express = require("express");
const router  = express.Router();

const { registrar, login, listarUsuarios, alterarSenha } = require("../controllers/authController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");

// POST /auth/login → público, retorna o token JWT
router.post("/login", login);

// POST /auth/registrar → protegido! apenas admin logado pode criar novos usuários
router.post("/registrar", verificarToken, apenasAdmin, registrar);

// GET /auth/usuarios → protegido! apenas admin pode ver quem tem acesso
router.get("/usuarios", verificarToken, apenasAdmin, listarUsuarios);

// PUT /auth/alterar-senha → protegido! usuário logado pode mudar sua própria senha
router.put("/alterar-senha", verificarToken, alterarSenha);

module.exports = router;
