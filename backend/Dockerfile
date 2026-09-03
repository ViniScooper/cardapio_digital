FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências de produção
RUN npm install --omit=dev

# Copia o código fonte do backend
COPY . .

# Expõe a porta do backend
EXPOSE 3001

# Inicia a aplicação
CMD ["node", "server.js"]
