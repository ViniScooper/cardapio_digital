FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências de produção
RUN npm install --omit=dev

# Copia o código fonte do backend
COPY . .

# Permissão de execução no script de inicialização
RUN chmod +x start.sh

# Expõe a porta do backend
EXPOSE 3001

# Inicia as migrações automáticas e o servidor
CMD ["./start.sh"]
