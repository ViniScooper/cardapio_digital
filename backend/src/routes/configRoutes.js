// ============================================================
// backend/src/routes/configRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const { obterConfig, atualizarHappyHour } = require("../controllers/configController");
const { verificarToken, apenasAdmin }     = require("../middleware/authMiddleware");

// GET /config — público
router.get("/", obterConfig);

// PUT /config/happy-hour — apenas admin
router.put("/happy-hour", verificarToken, apenasAdmin, atualizarHappyHour);

module.exports = router;
