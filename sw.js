// Este é o Service Worker básico para permitir a instalação da PWA
const CACHE_NAME = 'picoteflix-v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalado com sucesso!');
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Para já, não fazemos cache de filmes (ocuparia muito espaço), 
    // apenas deixamos a app ir à internet buscar os dados normalmente.
    event.respondWith(fetch(event.request));
});