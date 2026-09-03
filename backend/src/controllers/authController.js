// ============================================================
// backend/src/controllers/authController.js
// Lógica de registro e login de usuários
// ============================================================

const db      = require("../config/database");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "restaurante_jwt_secret_2024";

// POST /auth/registrar
const registrar = async (req, res) => {
    const { nome, email, senha, role } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Campos obrigatórios: nome, email e senha." });
    }

    try {
        // Criptografa a senha antes de salvar (nunca salve senha em texto puro!)
        const senhaHash = await bcrypt.hash(senha, 10);

        // Só aceita "admin" ou força "user" como padrão
        const perfil = role === "admin" ? "admin" : "user";

        const sql = "INSERT INTO usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)";

        db.query(sql, [nome, email, senhaHash, perfil], (erro, resultado) => {
            if (erro) {
                // Código ER_DUP_ENTRY = email já cadastrado (campo UNIQUE)
                if (erro.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({ erro: "Este email já está cadastrado." });
                }
                return res.status(500).json({ erro: erro.message });
            }

            res.status(201).json({
                mensagem: `Usuário cadastrado como ${perfil}!`,
                id: resultado.insertId
            });
        });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

// POST /auth/login
const login = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Email e senha são obrigatórios." });
    }

    const sql = "SELECT * FROM usuario WHERE email = ?";

    db.query(sql, [email], async (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: erro.message });

        if (resultado.length === 0) {
            return res.status(401).json({ erro: "Email ou senha incorretos." });
        }

        const usuario = resultado[0];

        // Compara a senha digitada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Email ou senha incorretos." });
        }

        // Gera o token JWT válido por 8 horas
        const token = jwt.sign(
            {
                id:    usuario.id,
                nome:  usuario.nome,
                email: usuario.email,
                role:  usuario.role
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: {
                id:    usuario.id,
                nome:  usuario.nome,
                email: usuario.email,
                role:  usuario.role
            }
        });
    });
};

module.exports = { registrar, login };
