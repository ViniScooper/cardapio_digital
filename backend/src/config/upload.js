// ============================================================
// backend/src/config/upload.js — Configuração do Multer
// ============================================================

const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Cria a pasta uploads/ automaticamente se não existir
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `prato-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|webp/;
    const extOk  = permitidos.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = permitidos.test(file.mimetype);
    if (extOk && mimeOk) cb(null, true);
    else cb(new Error("Apenas imagens JPG, PNG e WebP são permitidas."));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

module.exports = upload;
