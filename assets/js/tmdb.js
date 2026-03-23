const TMDB_KEY = "fbca6074ffbd9fb2ba2d8729956dd91c"; 
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500"; // ou original para qualidade máxima
const cache = {};

// Helper de Data
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Alterámos language=pt-PT para language=en-US
const LANG = "en-US"; 

export async function getPoster(tmdbId, type = "movie") {
  if (cache[tmdbId]) return cache[tmdbId];
  try {
    const url = `${BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const poster = data.poster_path ? IMG_URL + data.poster_path : "assets/img/no-poster.png";
    cache[tmdbId] = poster;
    return poster;
  } catch (e) {
    return "assets/img/no-poster.png";
  }
}

export async function getDetails(tmdbId, type = "movie") {
    try {
      // Pedimos dados em Inglês para garantir os posters oficiais
      const url = `${BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=${LANG}`;
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return null;
    }
}

// ==========================================
// PESQUISA NORMAL (MULTI) COM 4 PÁGINAS E ANTI-CLONES
// ==========================================
export async function searchMulti(query) {
  try {
      const encodedQuery = encodeURIComponent(query);
      
      // Pede as Páginas 1, 2, 3 e 4 simultaneamente
      const [res1, res2, res3, res4] = await Promise.all([
          fetch(`${BASE_URL}/search/multi?api_key=${TMDB_KEY}&language=${LANG}&query=${encodedQuery}&page=1`),
          fetch(`${BASE_URL}/search/multi?api_key=${TMDB_KEY}&language=${LANG}&query=${encodedQuery}&page=2`),
          fetch(`${BASE_URL}/search/multi?api_key=${TMDB_KEY}&language=${LANG}&query=${encodedQuery}&page=3`),
          fetch(`${BASE_URL}/search/multi?api_key=${TMDB_KEY}&language=${LANG}&query=${encodedQuery}&page=4`)
      ]);
      
      // Transforma todas as respostas em JSON
      const [data1, data2, data3, data4] = await Promise.all([
          res1.json(), res2.json(), res3.json(), res4.json()
      ]);
      
      // Junta os resultados todos
      const combined = [
          ...(data1.results || []), 
          ...(data2.results || []),
          ...(data3.results || []),
          ...(data4.results || [])
      ];
      
      // 🚨 FILTRO ANTI-CLONES
      const unicos = Array.from(new Map(combined.map(item => [item.id, item])).values());

      return unicos.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  } catch (e) {
      return [];
  }
}

// --- POPULARES (60 RESULTADOS) ---
export async function getTrendingMovies() {
  try {
    const [res1, res2, res3] = await Promise.all([
        fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=${LANG}&page=1`),
        fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=${LANG}&page=2`),
        fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=${LANG}&page=3`)
    ]);
    const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
    return [...(data1.results || []), ...(data2.results || []), ...(data3.results || [])];
  } catch (e) { return []; }
}

export async function getTrendingSeries() {
  try {
    const [res1, res2, res3] = await Promise.all([
        fetch(`${BASE_URL}/trending/tv/week?api_key=${TMDB_KEY}&language=${LANG}&page=1`),
        fetch(`${BASE_URL}/trending/tv/week?api_key=${TMDB_KEY}&language=${LANG}&page=2`),
        fetch(`${BASE_URL}/trending/tv/week?api_key=${TMDB_KEY}&language=${LANG}&page=3`)
    ]);
    const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
    return [...(data1.results || []), ...(data2.results || []), ...(data3.results || [])];
  } catch (e) { return []; }
}

// --- RECENTES (60 RESULTADOS) ---
export async function getRecentMovies() {
  try {
    const hoje = getTodayDate();
    const urlBase = `${BASE_URL}/discover/movie?api_key=${TMDB_KEY}&language=${LANG}&sort_by=primary_release_date.desc&primary_release_date.lte=${hoje}&vote_count.gte=10`;
    
    const [res1, res2, res3] = await Promise.all([
        fetch(`${urlBase}&page=1`),
        fetch(`${urlBase}&page=2`),
        fetch(`${urlBase}&page=3`)
    ]);
    const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
    return [...(data1.results || []), ...(data2.results || []), ...(data3.results || [])];
  } catch (e) { return []; }
}

export async function getRecentSeries() {
  try {
    const hoje = getTodayDate();
    const urlBase = `${BASE_URL}/discover/tv?api_key=${TMDB_KEY}&language=${LANG}&sort_by=first_air_date.desc&first_air_date.lte=${hoje}&include_null_first_air_dates=false`;
    
    const [res1, res2, res3] = await Promise.all([
        fetch(`${urlBase}&page=1`),
        fetch(`${urlBase}&page=2`),
        fetch(`${urlBase}&page=3`)
    ]);
    const [data1, data2, data3] = await Promise.all([res1.json(), res2.json(), res3.json()]);
    return [...(data1.results || []), ...(data2.results || []), ...(data3.results || [])];
  } catch (e) { return []; }
}

// --- RECOMENDAÇÕES POR GÉNERO (Para o teu "Porque viste...") (40 RESULTADOS) ---
export async function getRecommendationsByGenre(genreId, type) {
  try {
      const urlBase = `${BASE_URL}/discover/${type}?api_key=${TMDB_KEY}&with_genres=${genreId}&language=${LANG}&sort_by=popularity.desc`;
      
      const [res1, res2] = await Promise.all([
          fetch(`${urlBase}&page=1`),
          fetch(`${urlBase}&page=2`)
      ]);
      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
      return [...(data1.results || []), ...(data2.results || [])];
  } catch (error) {
      console.error("Erro recomendações:", error);
      return [];
  }
}

// ==========================================
// PESQUISA AVANÇADA INTELIGENTE COM 4 PÁGINAS E ANTI-CLONES
// ==========================================
export async function searchAdvanced(typesArray, genreIds) {
  try {
      let todosOsResultados = [];

      for (const type of typesArray) {
          
          // O Tradutor de Géneros das Séries
          let finalGenreIds = [...genreIds];
          if (type === 'tv') {
              finalGenreIds = genreIds.map(id => {
                  if (id === "28" || id === "12") return "10759";
                  if (id === "878" || id === "14") return "10765";
                  if (id === "27" || id === "53") return "9648";
                  if (id === "10749") return "18";
                  return id;
              });
          }
          
          finalGenreIds = [...new Set(finalGenreIds)];
          const genresParam = finalGenreIds.length > 0 ? `&with_genres=${finalGenreIds.join('|')}` : '';
          
          // URL Base para facilitar
          const baseUrlReq = `${BASE_URL}/discover/${type}?api_key=${TMDB_KEY}&language=${LANG}&sort_by=popularity.desc${genresParam}`;
          
          // Pede as Páginas 1, 2, 3 e 4 simultaneamente
          const [res1, res2, res3, res4] = await Promise.all([
              fetch(`${baseUrlReq}&page=1`),
              fetch(`${baseUrlReq}&page=2`),
              fetch(`${baseUrlReq}&page=3`),
              fetch(`${baseUrlReq}&page=4`)
          ]);
          
          const [data1, data2, data3, data4] = await Promise.all([
              res1.json(), res2.json(), res3.json(), res4.json()
          ]);
          
          // Junta os 80 resultados deste tipo (filmes ou séries)
          const combined = [
              ...(data1.results || []), 
              ...(data2.results || []),
              ...(data3.results || []),
              ...(data4.results || [])
          ];
          
          const resultadosMapeados = combined.map(item => ({ ...item, media_type: type }));
          todosOsResultados = [...todosOsResultados, ...resultadosMapeados];
      }

      // 🚨 FILTRO ANTI-CLONES GLOBAL (Garante que não há repetidos, mesmo cruzando dados)
      todosOsResultados = Array.from(new Map(todosOsResultados.map(item => [item.id, item])).values());

      // Mistura e ordena do mais popular para o menos popular
      todosOsResultados.sort((a, b) => b.popularity - a.popularity);

      return todosOsResultados;
  } catch (error) {
      console.error("Erro na pesquisa avançada:", error);
      return [];
  }
}