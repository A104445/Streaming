const BASE_URL = "https://vsembed.ru";

export async function getLatestMovies(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/movies/latest/page-${page}.json`);
    const data = await res.json();
    return data.result || [];
  } catch (e) {
    console.error("Erro Vidsrc Movies", e);
    return [];
  }
}

export async function getLatestEpisodes(page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/episodes/latest/page-${page}.json`);
    const data = await res.json();
    return data.result || [];
  } catch (e) {
    console.error("Erro Vidsrc TV", e);
    return [];
  }
}
