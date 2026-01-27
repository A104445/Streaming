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

export async function searchMulti(query) {
    try {
        const url = `${BASE_URL}/search/multi?api_key=${TMDB_KEY}&language=${LANG}&query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    } catch (e) {
        return [];
    }
}

// --- POPULARES ---
export async function getTrendingMovies() {
  try {
    const url = `${BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}&language=${LANG}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
  } catch (e) { return []; }
}

export async function getTrendingSeries() {
  try {
    const url = `${BASE_URL}/trending/tv/week?api_key=${TMDB_KEY}&language=${LANG}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
  } catch (e) { return []; }
}

// --- RECENTES ---
export async function getRecentMovies() {
  try {
    const hoje = getTodayDate();
    const url = `${BASE_URL}/discover/movie?api_key=${TMDB_KEY}&language=${LANG}&sort_by=primary_release_date.desc&primary_release_date.lte=${hoje}&vote_count.gte=10`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results; 
  } catch (e) { return []; }
}

export async function getRecentSeries() {
  try {
    const hoje = getTodayDate();
    const url = `${BASE_URL}/discover/tv?api_key=${TMDB_KEY}&language=${LANG}&sort_by=first_air_date.desc&first_air_date.lte=${hoje}&include_null_first_air_dates=false`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results; 
  } catch (e) { return []; }
}