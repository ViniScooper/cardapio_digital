// ============================================================
// backend/src/routes/seloRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { listarSelos, criarSelo, deletarSelo } = require("../controllers/seloController");
const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");

// GET /selos — público
router.get("/", listarSelos);

// POST /selos — admin
router.post("/", verificarToken, apenasAdmin, criarSelo);

// DELETE /selos/:id — admin
router.delete("/:id", verificarToken, apenasAdmin, deletarSelo);

module.exports = router;
