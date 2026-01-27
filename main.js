import { 
  getTrendingMovies, 
  getTrendingSeries, 
  getRecentMovies, 
  getRecentSeries 
} from "./tmdb.js"; 
import { headerTemplate, sectionCardTemplate } from "./templates.js";

const headerContainer = document.getElementById("header-container");
if(headerContainer) headerContainer.innerHTML = headerTemplate();

// Função auxiliar para validar e preencher
function fillSlider(elementId, data, type) {
  const slider = document.getElementById(elementId);
  if (!slider) return;

  slider.innerHTML = "";
  
  // Data de hoje para comparar
  const today = new Date();

  const validItems = data.filter(item => {
      // 1. Tem de ter capa
      if (!item.poster_path) return false;

      // 2. Filtrar Futuros (Opcional nos Trending, mas obrigatório nos Recentes)
      const dateStr = item.release_date || item.first_air_date;
      if (dateStr) {
          const releaseDate = new Date(dateStr);
          if (releaseDate > today) return false; // Ainda não saiu
      }

      return true;
  });

  if (validItems.length === 0) {
      slider.innerHTML = "<p style='padding:20px'>Indisponível de momento.</p>";
      return;
  }

  validItems.forEach(item => {
      const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
      const title = item.title || item.name;

      slider.innerHTML += sectionCardTemplate({
          tmdb_id: item.id,
          title: title,
          poster: poster,
          type: type
      });
  });
}

async function init() {
console.log("A carregar PicoteFlix...");

// Populares (Geralmente já têm vídeo)
const popMovies = await getTrendingMovies();
fillSlider("sliderPopularMovies", popMovies, "movie");

const popTV = await getTrendingSeries();
fillSlider("sliderPopularTV", popTV, "tv");

// Recentes (Aqui é crítico filtrar futuros)
const newMovies = await getRecentMovies();
fillSlider("sliderRecentMovies", newMovies, "movie");

const newTV = await getRecentSeries();
fillSlider("sliderRecentTV", newTV, "tv");
}

init();

// Funções globais
window.openMovie = (id, type) => {
if(!id) return;
window.location.href = `watch.html?tmdb=${id}&type=${type}`;
};

window.scrollSlider = (id, distance) => {
const el = document.getElementById(id);
if(el) el.scrollBy({ left: distance, behavior: 'smooth' });
};