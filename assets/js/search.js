import { searchMulti, searchAdvanced } from "./tmdb.js"; 
import { sectionCardTemplate } from "./templates.js";

setTimeout(() => {
  const searchInput = document.getElementById("searchInput");
  const btnOpenFilters = document.getElementById("btnOpenFilters");
  const filterPopup = document.getElementById("filterPopup");
  const btnApplyFilters = document.getElementById("btnApplyFilters");
  const btnClearFilters = document.getElementById("btnClearFilters");
  const mainContent = document.getElementById("main-content");
  const searchResults = document.getElementById("search-results");
  const resultsGrid = document.getElementById("results-grid");

  if (!searchInput) return;

  function desenharResultados(rawResults) {
      const cleanResults = rawResults.filter(item => {
        if (!item.poster_path) return false; 
        const date = item.release_date || item.first_air_date;
        if (!date) return false;
        if (new Date(date) > new Date()) return false; 
        return true;
      });

      resultsGrid.innerHTML = "";
      
      if (cleanResults.length === 0) {
        resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center'>Nenhum resultado corresponde aos teus filtros.</p>";
        return;
      }

      cleanResults.forEach(item => {
        const poster = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        resultsGrid.innerHTML += sectionCardTemplate({
          ...item,
          poster,
          type: item.media_type || (item.title ? 'movie' : 'tv')
        });
      });
  }

  // --- 1. ABRIR / FECHAR A CAIXA ---
  if (btnOpenFilters && filterPopup) {
      btnOpenFilters.addEventListener("click", (e) => {
          e.stopPropagation(); 
          if (filterPopup.style.display === "none" || filterPopup.style.display === "") {
              filterPopup.style.display = "block"; 
              btnOpenFilters.style.background = "var(--gold)"; 
              btnOpenFilters.style.color = "var(--bg)";
          } else {
              filterPopup.style.display = "none";
              btnOpenFilters.style.background = "#112240"; 
              btnOpenFilters.style.color = "white";
          }
      });

      document.addEventListener("click", (e) => {
          if (filterPopup.style.display === "block" && !filterPopup.contains(e.target) && e.target !== btnOpenFilters) {
              filterPopup.style.display = "none";
              btnOpenFilters.style.background = "#112240";
              btnOpenFilters.style.color = "white";
          }
      });
  }

  // --- 2. APLICAR FILTROS NO BOTÃO DO MENU ---
  if (btnApplyFilters) {
      btnApplyFilters.addEventListener("click", async () => {
          filterPopup.style.display = "none";
          btnOpenFilters.style.background = "#112240";
          btnOpenFilters.style.color = "white";

          const query = searchInput.value.trim();
          
          if (query.length > 0) {
              searchInput.dispatchEvent(new Event('input'));
              return;
          }

          // LER O TIPO SELECIONADO (Filme OU Série)
          const typeSelected = document.querySelector('input[name="filterType"]:checked').value;

          // LER OS GÉNEROS SELECIONADOS
          const checkedBoxes = document.querySelectorAll('#filterGenres input[type="checkbox"]:checked');
          const genreIds = Array.from(checkedBoxes).map(cb => cb.value);

          if (genreIds.length === 0) {
              alert("Por favor, seleciona pelo menos um género (ou pesquisa por nome)!");
              return;
          }

          mainContent.style.display = "none";
          if(searchResults) searchResults.style.display = "block";
          resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center'>A procurar combinações perfeitas...</p>";

          // Enviar os Arrays (Colocamos o typeSelected dentro de um array [ ] para não estragar a lógica do tmdb.js)
          const rawResults = await searchAdvanced([typeSelected], genreIds);
          desenharResultados(rawResults);
      });
  }

  // --- 3. LIMPAR FILTROS ---
  if (btnClearFilters) {
      btnClearFilters.addEventListener("click", () => {
          // Limpa todos os géneros
          document.querySelectorAll('#filterGenres input[type="checkbox"]').forEach(cb => cb.checked = false);
          
          // Volta a selecionar Filmes por defeito
          document.querySelector('input[name="filterType"][value="movie"]').checked = true;
          
          searchInput.value = "";
          
          filterPopup.style.display = "none";
          btnOpenFilters.style.background = "#112240";
          btnOpenFilters.style.color = "white";
          
          mainContent.style.display = "block";
          if(searchResults) searchResults.style.display = "none";
      });
  }

  // --- 4. PESQUISA NORMAL (TEXTO) COM FILTRAGEM ---
  let timeoutToken;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeoutToken);
    const query = e.target.value.trim();

    timeoutToken = setTimeout(async () => {
      if (query.length === 0) {
        mainContent.style.display = "block";
        if(searchResults) searchResults.style.display = "none";
        return;
      }

      mainContent.style.display = "none";
      if(searchResults) searchResults.style.display = "block";
      resultsGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center'>A pesquisar...</p>";

      let rawResults = await searchMulti(query);

      // --- FILTRAR OS RESULTADOS DE TEXTO DE ACORDO COM AS ESCOLHAS ---
      const typeSelected = document.querySelector('input[name="filterType"]:checked').value;
      
      const checkedBoxes = document.querySelectorAll('#filterGenres input[type="checkbox"]:checked');
      const genreIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

      rawResults = rawResults.filter(item => {
          // 1. Tem de ser do tipo selecionado (Filme ou Série)
          if (item.media_type !== typeSelected) return false;
          
          // 2. Se houver géneros, tem de bater certo (com o tradutor de séries)
          if (genreIds.length > 0) {
              if (!item.genre_ids) return false;
              
              let targetGenreIds = [...genreIds];
              if (item.media_type === 'tv') {
                  targetGenreIds = genreIds.map(id => {
                      if (id === 28 || id === 12) return 10759;
                      if (id === 878 || id === 14) return 10765;
                      if (id === 27 || id === 53) return 9648;
                      if (id === 10749) return 18;
                      return id;
                  });
              }
              
              const temGenero = targetGenreIds.some(id => item.genre_ids.includes(id));
              if (!temGenero) return false;
          }
          return true;
      });

      desenharResultados(rawResults);
    }, 500);
  });

}, 100);