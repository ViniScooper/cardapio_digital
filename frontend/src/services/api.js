// ============================================================
// src/services/api.js
// Configuração central do Axios para comunicar com o backend
// ============================================================

import axios from "axios";

// Pega automaticamente o mesmo hostname/IP que o cliente está usando no navegador
// Ex: se abriu pelo celular via http://192.168.1.5:5173, a API será http://192.168.1.5:3001
const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
export const API_BASE_URL = `http://${hostname}:3001`;

// URL base do backend
const api = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor: antes de cada requisição, coloca o token JWT no header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
