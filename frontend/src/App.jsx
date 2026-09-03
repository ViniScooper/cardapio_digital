// ============================================================
// src/App.jsx — Roteamento principal da aplicação
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar  from "./components/Navbar";
import Home    from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

// Rota protegida: redireciona para /login se não estiver logado como admin
function RotaAdmin({ children }) {
    const token   = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

    if (!token || !usuario || usuario.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Página pública — cardápio visível para todos */}
                <Route path="/"      element={<Home />} />

                {/* Página de login */}
                <Route path="/login" element={<Login />} />

                {/* Painel admin — apenas para usuários com role admin */}
                <Route
                    path="/admin"
                    element={
                        <RotaAdmin>
                            <Admin />
                        </RotaAdmin>
                    }
                />

                {/* Qualquer rota desconhecida volta para home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
