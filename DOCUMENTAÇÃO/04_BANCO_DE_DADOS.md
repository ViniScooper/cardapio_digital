# 🗄️ MODELAGEM DO BANCO DE DADOS (MySQL)

Esquema relacional do banco de dados `restaurante`.

---

## 1. Diagrama Lógico das Tabelas

```
+-------------------+        +--------------------+
|     categoria     |        |      usuario       |
+-------------------+        +--------------------+
| id (PK)           |        | id (PK)            |
| nome (VARCHAR)    |<---+   | nome (VARCHAR)     |
| icone (VARCHAR)   |    |   | email (UNIQUE)     |
| ordem (INT)       |    |   | senha (HASH)       |
| criado_em         |    |   | role (admin/user)  |
+-------------------+    |   | criado_em          |
                         |   +--------------------+
+-------------------+    |
|       prato       |    |   +--------------------+
+-------------------+    |   |    configuracao    |
| id (PK)           |    |   +--------------------+
| nome (VARCHAR)    |    |   | id (PK = 1)        |
| descricao (TEXT)  |    |   | hh_ativo (TINYINT) |
| preco (DECIMAL)   |    |   | hh_dias (VARCHAR)  |
| categoria (FK log)|----+   | hh_inicio (VARCHAR)|
| happy_hour (BOOL) |        | hh_fim (VARCHAR)   |
| imagem (VARCHAR)  |        | atualizado_em      |
| criado_em         |        +--------------------+
+-------------------+
```

---

## 2. Scripts DDL de Criação das Tabelas

```sql
CREATE DATABASE IF NOT EXISTS restaurante;
USE restaurante;

-- Tabela de Usuários e Administradores
CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias do Menu
CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(10) NOT NULL DEFAULT '🍴',
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pratos
CREATE TABLE IF NOT EXISTS prato (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'Cardápio',
    happy_hour TINYINT(1) DEFAULT 0,
    imagem VARCHAR(255) DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações Globais (Happy Hour)
CREATE TABLE IF NOT EXISTS configuracao (
    id INT PRIMARY KEY DEFAULT 1,
    hh_ativo TINYINT(1) DEFAULT 1,
    hh_dias VARCHAR(255) DEFAULT 'Segunda, Terça e Quarta',
    hh_inicio VARCHAR(10) DEFAULT '19:00',
    hh_fim VARCHAR(10) DEFAULT '22:00',
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
