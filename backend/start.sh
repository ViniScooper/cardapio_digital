#!/bin/sh
set -e

echo "🚀 [Boteco API] Verificando e rodando migrações automáticas..."
node migrar-banco-completo.js || true
node seed-cardapio-real.js || true
node migrar-engenharia.js || true
node migrar-selos.js || true

echo "✅ [Boteco API] Migrações prontas! Iniciando servidor..."
exec node server.js
