import { searchMulti } from "./tmdb.js";
import { sectionCardTemplate } from "./templates.js";

setTimeout(() => {
  const searchInput = document.getElementById("searchInput");
  const mainContent = document.getElementById("main-content");
  const searchResults = document.getElementById("search-results");
  const resultsGrid = document.getElementById("results-grid");

  if (!searchInput) return;

  let timeoutToken;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeoutToken);
    const query = e.target.value.trim();

    timeoutToken = setTimeout(async () => {
      // Se a pesquisa estiver vazia, volta ao normal
      if (query.length === 0) {
        mainContent.style.display = "block";
        if(searchResults) searchResults.style.display = "none";
        return;
      }

      // Mostra a área de resultados
      mainContent.style.display = "none";
      if(searchResults) searchResults.style.display = "block";
      resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center'>A pesquisar...</p>";

      const rawResults = await searchMulti(query);
      
      // --- FILTRAGEM RIGOROSA ---
      const cleanResults = rawResults.filter(item => {
        // 1. Tem de ter imagem (poster)
        if (!item.poster_path) return false;
        
        // 2. Tem de ter data de lançamento (evita erros de DB)
        const date = item.release_date || item.first_air_date;
        if (!date) return false;

        // 3. A data não pode ser no futuro (Filme ainda não saiu = Sem vídeo)
        const releaseDate = new Date(date);
        const today = new Date();
        if (releaseDate > today) return false;

        return true;
      });

      resultsGrid.innerHTML = "";
      
      if (cleanResults.length === 0) {
        resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center'>Nenhum resultado disponível (ou sem vídeo).</p>";
        return;
      }

      cleanResults.forEach(item => {
        // Como já filtrámos os nulls, podemos usar direto
        const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        
        resultsGrid.innerHTML += sectionCardTemplate({
          ...item,
          poster,
          // Garante que passamos o tipo correto para o link funcionar
          type: item.media_type || (item.title ? 'movie' : 'tv')
        });
      });

    }, 500); // Delay de meio segundo
  });
}, 100);