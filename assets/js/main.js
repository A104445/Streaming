import { 
  getTrendingMovies, getTrendingSeries, getRecentMovies, getRecentSeries,
  getRecommendationsByGenre, getDetails
} from "./tmdb.js"; 

import { getTopGenre, getWatchedIds, getWatchLaterList, obterTodoOProgresso, removerProgresso } from "./db-logic.js"; 
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

        await carregarContinuarAVer(user);

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

// ==========================================
// LÓGICA DO CONTINUAR A VER (Com Cálculo Inteligente de Temporadas)
// ==========================================
async function carregarContinuarAVer(user) {
    const section = document.getElementById('continueWatchingSection');
    const slider = document.getElementById('sliderContinue'); 
    
    if (!user || !section || !slider) return;

    const progresso = await obterTodoOProgresso();
    
    if (progresso.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    slider.innerHTML = ''; 

    for (const item of progresso) {
        try {
            const detalhes = await getDetails(item.id, 'tv');
            if (!detalhes || !detalhes.seasons) continue; 
            
            // 1. Encontrar a temporada que o utilizador está a ver nos dados oficiais do TMDB
            const seasonAtualData = detalhes.seasons.find(s => s.season_number === parseInt(item.season));
            
            let proximoEpisodio = parseInt(item.episode);
            let proximaTemporada = parseInt(item.season);
            let serieTerminada = false;

            // 2. LÓGICA INTELIGENTE DE EPISÓDIOS E TEMPORADAS
            if (seasonAtualData) {
                if (proximoEpisodio < seasonAtualData.episode_count) {
                    // Ainda há episódios nesta temporada
                    proximoEpisodio += 1;
                } else {
                    // Chegámos ao fim desta temporada! Vamos ver se a próxima existe.
                    const proximaSeasonData = detalhes.seasons.find(s => s.season_number === proximaTemporada + 1);
                    
                    if (proximaSeasonData && proximaSeasonData.episode_count > 0) {
                        // Existe temporada seguinte. Salta para a T+1, Ep 1
                        proximaTemporada += 1;
                        proximoEpisodio = 1;
                    } else {
                        // Não há mais temporadas nem episódios. A série foi concluída!
                        serieTerminada = true;
                    }
                }
            } else {
                // Caso a API falhe por algum motivo anormal, avança só um episódio
                proximoEpisodio += 1;
            }

            // 3. SE A SÉRIE ACABOU: Apaga da BD automaticamente e não a desenha no ecrã!
            if (serieTerminada) {
                await removerProgresso(item.id);
                continue; 
            }

            // 4. DESENHAR O CARTÃO COM OS DADOS NOVOS
            const poster = detalhes.poster_path ? `https://image.tmdb.org/t/p/w200${detalhes.poster_path}` : 'https://placehold.co/200x300?text=Sem+Capa';
            
            // ... (código anterior: const poster = detalhes.poster_path...)
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.position = 'relative'; 
            
            // Desenhamos o cartão com o botão X a usar um ALERTA INLINE
            card.innerHTML = `
                <img src="${poster}" alt="${detalhes.name}" class="clicavel-ir-episodio" style="cursor: pointer;">
                
                <button 
                    onclick="event.preventDefault(); event.stopPropagation(); window.abrirModalRemover(event, ${item.id}, this);" 
                    style="position: absolute; top: 10px; left: 10px; background: rgba(229, 9, 20, 0.85); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 9999; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: background 0.3s;" 
                    onmouseover="this.style.background='#E50914'" 
                    onmouseout="this.style.background='rgba(229, 9, 20, 0.85)'">
                    ✕
                </button>

                <div style="position: absolute; top: 10px; right: 10px; background: var(--gold); color: var(--bg); font-weight: bold; padding: 3px 8px; border-radius: 5px; font-size: 0.8rem; box-shadow: 0 2px 5px rgba(0,0,0,0.5); pointer-events: none;">
                    S${proximaTemporada} E${proximoEpisodio}
                </div>

                <div class="card-info clicavel-ir-episodio" style="cursor: pointer;">
                    <h3>${detalhes.name}</h3>
                </div>
            `;

            // Clique da Imagem para ver a série (mantém-se igual)
            const irParaEpisodio = () => window.location.href = `watch.html?tmdb=${item.id}&type=tv&s=${proximaTemporada}&e=${proximoEpisodio}`;
            card.querySelectorAll('.clicavel-ir-episodio').forEach(elemento => {
                elemento.addEventListener('click', irParaEpisodio);
            });

            slider.appendChild(card);
        } catch (erro) {
            console.error("Erro ao desenhar série continuada:", erro);
        }
    }
    
    // Se, por acaso, todas as séries que estavas a ver tiverem terminado e apagadas nesta corrida, esconde a secção!
    if (slider.children.length === 0) {
        section.style.display = 'none';
    }
}

// ==========================================
// FUNÇÃO INFALÍVEL (MODAL GERADO EM JS PURO)
// ==========================================
window.abrirModalRemover = (event, id, btnElement) => {
    // 1. Cria a camada escura que cobre o ecrã todo (z-index gigante)
    const overlay = document.createElement('div');
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 999999; display: flex; justify-content: center; align-items: center;";

    // 2. Cria a caixa do Modal
    const box = document.createElement('div');
    box.style.cssText = "background: #141414; padding: 30px; border-radius: 12px; border: 1px solid #333; text-align: center; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); animation: popupFade 0.3s ease-out;";

    // 3. Injeta o conteúdo lá dentro
    box.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 15px;">🗑️</div>
        <h2 style="color: white; font-size: 1.5rem; margin-bottom: 10px; border:none;">Remover Série</h2>
        <p style="color: #bbb; margin-bottom: 20px;">Queres mesmo remover esta série da tua lista de "Continuar a Ver"?</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
            <button id="js-btn-sim" style="background: #E50914; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-size: 1rem; font-weight: bold; width: 100%;">Sim, Remover</button>
            <button id="js-btn-nao" style="background: #333; color: white; border: none; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-size: 1rem; width: 100%;">Cancelar</button>
        </div>
    `;

    // 4. Cola a caixa no fundo escuro, e o fundo escuro no ecrã!
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // 5. Lógica do botão "Cancelar"
    document.getElementById('js-btn-nao').onclick = () => {
        overlay.remove(); // Destrói o modal
    };

    // 6. Lógica do botão "Sim, Remover"
    document.getElementById('js-btn-sim').onclick = async () => {
        document.getElementById('js-btn-sim').innerText = "A remover...";
        
        // Vai à Base de Dados apagar
        const sucesso = await removerProgresso(id);
        
        if (sucesso) {
            overlay.remove(); // Destrói o modal imediatamente
            
            // Faz o cartão encolher e desaparecer
            const card = btnElement.closest('.card');
            if(card) {
                card.style.transition = "opacity 0.3s, transform 0.3s";
                card.style.opacity = "0";
                card.style.transform = "scale(0.8)";
                
                setTimeout(() => {
                    card.remove(); 
                    
                    // Esconde a secção inteira se a prateleira ficar vazia
                    const slider = document.getElementById('sliderContinue');
                    if (slider && slider.children.length === 0) {
                        const sec = document.getElementById('continueWatchingSection');
                        if (sec) sec.style.display = 'none';
                    }
                }, 300);
            }
        } else {
            alert("Ocorreu um erro a apagar da Base de Dados.");
            overlay.remove();
        }
    };
};

init();

// Globais para o HTML funcionar
window.openMovie = (id, type) => window.location.href = `watch.html?tmdb=${id}&type=${type}`;
window.scrollSlider = (id, dist) => document.getElementById(id)?.scrollBy({ left: dist, behavior: 'smooth' });