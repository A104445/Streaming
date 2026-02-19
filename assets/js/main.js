import { 
  getTrendingMovies, getTrendingSeries, getRecentMovies, getRecentSeries,
  getRecommendationsByGenre 
} from "./tmdb.js"; 

import { getTopGenre, getWatchedIds, getWatchLaterList } from "./db-logic.js"; 
import { auth, onAuthStateChanged } from "./firebase-config.js";
import { headerTemplate, sectionCardTemplate } from "./templates.js";

const headerContainer = document.getElementById("header-container");
if(headerContainer) headerContainer.innerHTML = headerTemplate();

// Função auxiliar para preencher sliders
function fillSlider(elementId, data, type) {
  const slider = document.getElementById(elementId);
  if (!slider) return;

  slider.innerHTML = "";
  const validItems = (data || []).filter(item => item.poster_path || item.poster);

  if (validItems.length === 0) {
      slider.innerHTML = "<p style='padding:20px'>Sem recomendações.</p>";
      return;
  }

  validItems.forEach(item => {
      const imagePath = item.poster_path || item.poster;
      slider.innerHTML += sectionCardTemplate({
          tmdb_id: item.id,
          title: item.title || item.name,
          poster: `https://image.tmdb.org/t/p/w500${imagePath}`,
          type: type
      });
  });
}

// 1. CARREGAR O BÁSICO (Populares)
async function init() {
    console.log("A iniciar PicoteFlix...");
    
    // Carrega tudo em paralelo para ser mais rápido
    const [popMovies, popTV, newMovies, newTV] = await Promise.all([
        getTrendingMovies(),
        getTrendingSeries(),
        getRecentMovies(),
        getRecentSeries()
    ]);

    fillSlider("sliderPopularMovies", popMovies, "movie");
    fillSlider("sliderPopularTV", popTV, "tv");
    fillSlider("sliderRecentMovies", newMovies, "movie");
    fillSlider("sliderRecentTV", newTV, "tv");
}

// 2. CARREGAR AS 4 LINHAS DE RECOMENDAÇÕES (Só se logado)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("A gerar recomendações personalizadas...");

        const watched = await getWatchedIds();

        // --- A. HISTÓRICO (VISTOS) ---
        
        // 1. Filmes baseados no Histórico
        const genreHistMovie = await getTopGenre('history', 'movie');
        if (genreHistMovie) {
            const recs = await getRecommendationsByGenre(genreHistMovie, 'movie');
            const filtrados = recs.filter(filme => !watched.movie.includes(String(filme.id)));
            if (filtrados.length > 0) {
                document.getElementById("rec-movies-hist").style.display = "block";
                fillSlider("sliderRecMoviesHist", filtrados, "movie");
            }
        }

        // 2. Séries baseadas no Histórico
        const genreHistTV = await getTopGenre('history', 'tv');
        if (genreHistTV) {
            const recs = await getRecommendationsByGenre(genreHistTV, 'tv');
            const filtrados = recs.filter(item => !watched.tv.includes(String(item.id)));
            if (filtrados.length > 0) {
                document.getElementById("rec-series-hist").style.display = "block";
                fillSlider("sliderRecSeriesHist", filtrados, "tv");
            }
        }

        // --- B. FAVORITOS (LIKES) ---

        // 3. Filmes baseados nos Likes
        const genreLikeMovie = await getTopGenre('likes', 'movie');
        if (genreLikeMovie) {
            const recs = await getRecommendationsByGenre(genreLikeMovie, 'movie');
            const filtrados = recs.filter(item => !watched.movie.includes(String(item.id)));
            if (filtrados.length > 0) {
                document.getElementById("rec-movies-likes").style.display = "block";
                fillSlider("sliderRecMoviesLikes", filtrados, "movie");
            }
        }

        // 4. Séries baseadas nos Likes
        const genreLikeTV = await getTopGenre('likes', 'tv');
        if (genreLikeTV) {
            const recs = await getRecommendationsByGenre(genreLikeTV, 'tv');
            const filtrados = recs.filter(item => !watched.tv.includes(String(item.id)));
            if (filtrados.length > 0) {
                document.getElementById("rec-series-likes").style.display = "block";
                fillSlider("sliderRecSeriesLikes", filtrados, "tv");
            }
        }

        // C. VER MAIS TARDE
        
        const laterMovies = await getWatchLaterList('movie');
        if (laterMovies.length > 0) {
            document.getElementById("later-movies-section").style.display = "block";
            fillSlider("sliderLaterMovies", laterMovies, "movie");
        }

        const laterTV = await getWatchLaterList('tv');
        if (laterTV.length > 0) {
            document.getElementById("later-series-section").style.display = "block";
            fillSlider("sliderLaterTV", laterTV, "tv");
        }
    }
});

// --- FUNÇÃO DE FILTRAGEM (CASA / FILMES / SÉRIES) ---
// Esta função precisa de estar acessível globalmente (window)
window.filtrarCategoria = (tipo, btnClicado) => {
    
    // 1. Atualizar visual dos botões (Muda a cor do ativo)
    const botoes = document.querySelectorAll('.nav-icon');
    botoes.forEach(btn => btn.classList.remove('active'));
    btnClicado.classList.add('active');

    // 2. Selecionar todas as áreas que têm sliders (h2 + div slider)
    // No teu index.html, os títulos H2 estão soltos antes dos sliders, 
    // mas as secções que adicionámos (Ver Mais Tarde / Recomendações) têm divs próprias.
    // Vamos filtrar pelo ID dos sliders.

    const sliders = document.querySelectorAll('.slider');

    sliders.forEach(slider => {
        // Encontra o título H2 e o container imediatamente antes/acima deste slider
        const container = slider.closest('.category-section') || slider.parentElement.parentElement;
        // Nota: O teu HTML mistura estruturas, por isso usamos o parentElement para apanhar o bloco todo.
        
        // Identificar se é Filme ou Série pelo ID do slider
        const id = slider.id.toLowerCase();
        const isMovie = id.includes('movie');
        const isTV = id.includes('tv') || id.includes('series');

        // Lógica de esconder/mostrar
        if (tipo === 'all') {
            container.classList.remove('hidden-filter');
            // Re-aplicar display:none se estiver vazio (lógica original) é gerido pelo fillSlider, 
            // aqui apenas removemos o nosso filtro forçado.
        } 
        else if (tipo === 'movie') {
            if (isTV) container.classList.add('hidden-filter');
            else container.classList.remove('hidden-filter');
        } 
        else if (tipo === 'tv') {
            if (isMovie) container.classList.add('hidden-filter');
            else container.classList.remove('hidden-filter');
        }
    });
    
    // Pequeno ajuste para os títulos H2 soltos no início do teu HTML (Populares/Recentes)
    // Como eles não estão dentro de uma "category-section" no teu HTML original,
    // o código acima pode falhar neles. 
    // SUGESTÃO: Para ficar perfeito, garante que no index.html envolves cada par (H2 + Slider) 
    // numa <div class="category-section">, como fizeste para o "Ver Mais Tarde".
};

init();

// Globais para o HTML funcionar
window.openMovie = (id, type) => window.location.href = `watch.html?tmdb=${id}&type=${type}`;
window.scrollSlider = (id, dist) => document.getElementById(id)?.scrollBy({ left: dist, behavior: 'smooth' });