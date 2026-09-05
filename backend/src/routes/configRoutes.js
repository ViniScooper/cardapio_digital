// ============================================================
// backend/src/routes/configRoutes.js
// ============================================================

const express = require("express");
const router  = express.Router();

const {
    obterConfig,
    atualizarHappyHour,
    atualizarDeliveryConfig,
    listarBairrosDelivery,
    listarTodosBairrosAdmin,
    salvarBairroDelivery,
    excluirBairroDelivery,
    calcularFreteDelivery
} = require("../controllers/configController");

const { verificarToken, apenasAdmin } = require("../middleware/authMiddleware");

// GET /config — público
router.get("/", obterConfig);

// PUT /config/happy-hour — apenas admin
router.put("/happy-hour", verificarToken, apenasAdmin, atualizarHappyHour);

// Delivery - Configurações gerais (admin)
router.put("/delivery", verificarToken, apenasAdmin, atualizarDeliveryConfig);

// Delivery - Lista de bairros para cliente (público)
router.get("/delivery/bairros", listarBairrosDelivery);

// Delivery - Lista de bairros para admin (com inativos)
router.get("/delivery/bairros/admin", verificarToken, apenasAdmin, listarTodosBairrosAdmin);

// Delivery - Criar ou editar bairro (admin)
router.post("/delivery/bairros", verificarToken, apenasAdmin, salvarBairroDelivery);

// Delivery - Excluir bairro (admin)
router.delete("/delivery/bairros/:id", verificarToken, apenasAdmin, excluirBairroDelivery);

// Delivery - Calcular taxa por CEP / Bairro (público)
router.post("/delivery/calcular", calcularFreteDelivery);

module.exports = router;
