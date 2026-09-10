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

export default api;
