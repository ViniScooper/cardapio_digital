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

// Interceptor: antes de cada requisição, coloca o token JWT no header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
