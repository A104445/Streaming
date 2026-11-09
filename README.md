# PicoteFlix (Streaming Platform)

Plataforma de streaming web moderna e interativa, inspirada em serviços de vídeo sob demanda (VoD), desenvolvida com uma arquitetura frontend modular em JavaScript puro, integração com o ecossistema Firebase e consumo da TMDB API para catálogos dinâmicos de filmes e séries.

## Sobre o Projeto

O **PicoteFlix** simula a experiência de um serviço de streaming completo. A aplicação oferece um catálogo rico alimentado em tempo real por dados de media externos, sistema completo de autenticação e gestão de perfis de utilizador, histórico de visualização, integração de leitores de vídeo externos (`vidsrc`) e planos de subscrição simulados.

### Principais Funcionalidades:

* **Autenticação e Gestão de Contas (`auth.js`, `login-logic.js`):** Sistema de registo, login, recuperação de conta e segurança integrado com o Firebase Auth.
* **Catálogo Dinâmico TMDB (`tmdb.js`):** Consumo assíncrono da API da The Movie Database para listagem de tendências, capas, sinopses, trailers e categorias (filmes e séries).
* **Motor de Pesquisa Avançado (`search.js`):** Filtragem em tempo real de conteúdos multimédia.
* **Leitor de Vídeo Integrado (`vidsrc.js` e `watch.html`):** Reprodução de conteúdos através de integração com o serviço de streaming de vídeo `vidsrc`.
* **Histórico e Perfil de Utilizador (`profile-logic.js`, `history.html`):** Registo de visualizações recentes, favoritos e personalização de dados de perfil.
* **Planos de Subscrição (`plans.html`):** Ecrã dedicado à escolha de planos de acesso à plataforma.
* **Progressive Web App (PWA):** Suporte a *Service Workers* (`sw.js`) e manifesto para instalação e funcionamento otimizado.

## Stack Tecnológica

* **Frontend:** HTML5, CSS3 (com componentes visuais personalizados e responsivos)
* **Linguagem Principal:** JavaScript (ES6+ modular, organizado por lógicas de serviço/página)
* **Backend & Base de Dados:** Firebase (Authentication & Firestore)
* **APIs Externas:** TMDB API (The Movie Database) para metadados de filmes/séries e VidSrc para reprodução de vídeo.

## Estrutura do Repositório

O projeto segue uma organização modular baseada em páginas estáticas e módulos JavaScript:

```text
Streaming-main/
├── assets/
│   ├── css/            # Estilos globais e específicos da interface (style.css)
│   ├── img/            # Logos, avatares por defeito e elementos visuais
│   └── js/             # Lógica modular da aplicação:
│       ├── auth.js             # Controlo de sessão e estado de autenticação
│       ├── db-logic.js         # Interação com a base de dados (Firestore)
│       ├── firebase-config.js  # Configuração e inicialização do Firebase
│       ├── login-logic.js      # Gestão de formulários de login/registo
│       ├── main.js             # Ponto de entrada global e rotas de UI
│       ├── profile-logic.js    # Gestão de perfis e preferências
│       ├── search.js           # Lógica de motor de busca
│       ├── templates.js        # Componentes HTML reutilizáveis via JS
│       ├── tmdb.js             # Comunicação com a TMDB API
│       └── vidsrc.js           # Gestão do player de vídeo
├── history.html        # Página de histórico de visualização
├── index.html          # Página principal (Dashboard / Catálogo)
├── login.html          # Ecrã de autenticação
├── plans.html          # Ecrã de planos de subscrição
├── profile.html        # Gestão de perfil de utilizador
├── watch.html          # Leitor de vídeo e reprodução de conteúdos
├── sw.js               # Service Worker para PWA
└── manifest.json       # Manifesto da aplicação PWA
```

## Como Executar Localmente

### 1. Pré-requisitos
Como se trata de uma aplicação web baseada em HTML/JS estático modular, apenas precisas de um servidor web local (como a extensão *Live Server* do VS Code) ou de clonar o repositório.

### 2. Configurar as Credenciais
1. Cria um projeto na consola do [Firebase](https://console.firebase.google.com/) e ativa o **Authentication** e o **Firestore**.
2. Obtém as tuas credenciais de configuração e insere-as no ficheiro `assets/js/firebase-config.js`.
3. Obtém uma chave de API gratuita em [TMDB API](https://www.themoviedb.org/documentation/api) e configura-a no módulo de requisições (`assets/js/tmdb.js`).

### 3. Executar a Aplicação
* Abre a pasta do projeto no teu editor de código (ex: VS Code).
* Inicia a aplicação utilizando o **Live Server** (ou abre o ficheiro `index.html` diretamente no browser, embora se recomende um servidor local para evitar restrições de CORS nos módulos ES6).

---
*Projeto desenvolvido para demonstração de competências em desenvolvimento frontend dinâmico, consumo de APIs REST e integração com serviços cloud (Firebase).*
