// ============================================================
// src/services/api.js
// Configuração central do Axios para comunicar com o backend
// ============================================================

import axios from "axios";
import { BASE_API_URL } from "../config/environment";

export const API_BASE_URL = BASE_API_URL;

// URL base do backend
const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor: antes de cada requisição, coloca o token JWT e headers anti-cache
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Força o navegador a sempre buscar dados novos da API (evita cache de pratos/categorias)
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    // Adiciona timestamp em requisições GET para quebrar cache de navegadores mobile
    if (config.method === "get") {
        config.params = {
            ...config.params,
            _t: Date.now()
        };
    }

    return config;
});

// Interceptor de Erros: Envia telemetria automaticamente para a central de logs do CloudOps Hub
api.interceptors.response.use(
    (response) => response,
    (error) => {
        try {
            const status = error.response ? error.response.status : 0;
            const endpoint = error.config ? error.config.url : "";
            const method = error.config ? error.config.method : "GET";
            const msg = error.response?.data?.erro || error.message || "Erro desconhecido";

            // Envia para o CloudOps Hub em background (não bloqueia a UI do cliente)
            fetch("http://localhost:3005/api/telemetry/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: window.location.pathname.includes("/admin") ? "Painel Admin" : "Cardápio Digital",
                    level: status >= 500 || status === 0 ? "ERROR" : "WARN",
                    message: `Falha na requisição [HTTP ${status}]: ${msg}`,
                    path: endpoint,
                    method: method.toUpperCase(),
                    statusCode: status,
                    details: error.response?.data || error.stack || null,
                    userAgent: navigator.userAgent
                })
            }).catch(() => {});
        } catch (e) {}

        return Promise.reject(error);
    }
);

export default api;
