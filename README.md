# 📊 Fincheck

O **Fincheck** é um aplicativo fullstack desenvolvido para ajudar usuários a monitorar suas finanças pessoais de forma fácil e eficiente.
O objetivo do projeto é fornecer ferramentas que permitam o **controle total sobre contas bancárias, investimentos, despesas, receitas e planejamento financeiro**.

Este projeto foi desenvolvido como parte do curso **[JStack](https://jstack.com.br/)** e teve como foco a prática de **desenvolvimento fullstack moderno**, explorando desde o backend com NestJS até o frontend com React.

---

## 🚀 Funcionalidades

### 🔐 Autenticação

* Criação de conta
* Login seguro com **JWT**
* Dashboard privado para cada usuário

### 🏦 Contas Bancárias

* Cadastro, edição e exclusão de contas
* Gerenciamento de saldos
* Associação de transações por conta

### 📈 Visão 360º

* Consolidação de todas as contas e investimentos em uma única tela
* Relatórios e gráficos para análise financeira
* Visualização de despesas e receitas organizadas

---

## 🛠️ Tecnologias Utilizadas

### **Backend**

* **Node.js** → Ambiente de execução do servidor
* **NestJS** → Framework modular para estruturar a API
* **Prisma ORM** → Comunicação com banco de dados **PostgreSQL**
* **JWT (JSON Web Token)** → Autenticação e autorização
* **Swagger** → Documentação da API
* **Jest** → Testes unitários e de integração

### **Frontend**

* **React** → Criação de interfaces reativas
* **Vite** → Build tool rápida para desenvolvimento
* **TailwindCSS** → Estilização com classes utilitárias
* **React Router** → Navegação entre telas
* **Axios / Fetch** → Comunicação com a API

### **Banco de Dados**

* **PostgreSQL** → Armazenamento relacional das informações financeiras

---

## 📚 Estrutura do Projeto

### 🔹 Backend (NestJS)

* **Módulo de Usuários** → Cadastro, autenticação e gestão de contas
* **Módulo de Contas Bancárias** → CRUD de contas
* **Módulo de Transações** → Registro de receitas e despesas
* **Guards e Interceptors** → Segurança e controle de acesso

### 🔹 Frontend (React)

* **UI/UX e Setup** → Configuração inicial com Vite e Tailwind
* **Autenticação** → Fluxo de login e criação de conta
* **Dashboard** → Visualização consolidada das finanças
* **Integração** → Consumo da API e atualização em tempo real

---

## 🖼️ Wireframes e Telas

### 🔑 Fluxo de Autenticação

![Login e Cadastro](./docs/images/auth-flow.png)

### 📊 Dashboard

![Dashboard](./docs/images/dashboard.png)

### 📱 Protótipo Mobile

![Protótipo Mobile](./docs/images/mobile-wireframes.png)

---

## 📖 O que foi aprendido

Durante o desenvolvimento do **Fincheck**, foram aplicados conceitos e boas práticas de **desenvolvimento fullstack**:

* **Configuração de projetos modernos** com Vite (frontend) e NestJS (backend)
* **Clean Architecture básica**: separação entre camadas (controllers, services, repositories)
* **Princípios de autenticação segura** com JWT
* **Documentação de APIs** com Swagger
* **Modelagem de banco de dados** com Prisma + PostgreSQL
* **Estilização com Tailwind** para maior produtividade no frontend
* **Integração frontend-backend** utilizando chamadas REST
* **Testes automatizados com Jest**, garantindo qualidade e confiabilidade
* **Melhores práticas de UI/UX** aplicadas no design das telas

---

## 📌 Como rodar o projeto

### Backend

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run start:dev
```

### Frontend

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Banco de Dados

```bash
# Rodar migrações do Prisma
npx prisma migrate dev
```

---

## ✅ Conclusão

O **Fincheck** foi uma oportunidade prática para desenvolver um projeto **fullstack completo**, integrando **frontend (React)**, **backend (NestJS)** e **banco de dados (PostgreSQL)**.
O aprendizado envolveu desde a **modelagem de dados** até a **experiência do usuário**, passando por **integração de APIs**, **segurança** e **testes**.

Esse projeto consolida o conhecimento adquirido no **curso JStack** e serve como base para evoluções futuras, como relatórios avançados, integrações com bancos reais e recursos de inteligência financeira.
