export function headerTemplate(esconderFiltros = false) {

  const navHTML = esconderFiltros ? '' : `
      <div class="nav-center">
          <button class="nav-icon active" onclick="filtrarCategoria('all', this)" title="Início">🏠</button>
          <button class="nav-icon" onclick="filtrarCategoria('movie', this)" title="Apenas Filmes">Filmes</button>
          <button class="nav-icon" onclick="filtrarCategoria('tv', this)" title="Apenas Séries">Séries</button>
      </div>
  `;

  return `
    <style>
        .filter-hidden-input { display: none; }
        .filter-tag {
            display: flex; align-items: center; justify-content: center; width: 100%; box-sizing: border-box;
            padding: 10px 5px; background: #112240; border: 1px solid #30475e; border-radius: 8px;
            color: #ccc; cursor: pointer; font-size: 0.85rem; transition: all 0.2s ease;
            user-select: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .filter-tag:hover { border-color: var(--gold); color: white; transform: translateY(-2px); }
        .filter-hidden-input:checked + .filter-tag {
            background: var(--gold); color: var(--bg); border-color: var(--gold); font-weight: bold;
        }
    </style>

    <header class="header">
      <div class="logo" onclick="window.location.href='index.html'">Picote<span style="color: white;">Flix</span></div>
      
      ${navHTML}

      <div class="header-right">
        
        <div style="display: flex; align-items: center; gap: 10px; position: relative;">
            
            <button id="btnOpenFilters" style="background: #112240; color: white; border: 1px solid #30475e; padding: 0; border-radius: 50%; cursor: pointer; transition: 0.3s; width: 40px; height: 40px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;" title="Filtros Avançados">
                🎚️
            </button>
            
            <input id="searchInput" type="text" placeholder="Pesquisar por nome...">

            <div id="filterPopup" style="display: none; position: absolute; top: 120%; left: 0; background: #0a1a2f; border: 1px solid var(--gold); border-radius: 8px; padding: 25px; width: 380px; max-width: 90vw; box-sizing: border-box; z-index: 9999; box-shadow: 0 10px 40px rgba(0,0,0,0.9); text-align: left;">
                
                <h4 style="margin: 0 0 15px 0; color: var(--gold); border-bottom: 1px solid #30475e; padding-bottom: 5px; font-size: 1.1rem;">O que procuras?</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px;">
                    <label style="margin: 0;">
                        <input type="radio" name="filterType" value="movie" class="filter-hidden-input" checked>
                        <span class="filter-tag">🎬 Filmes</span>
                    </label>
                    <label style="margin: 0;">
                        <input type="radio" name="filterType" value="tv" class="filter-hidden-input">
                        <span class="filter-tag">📺 Séries</span>
                    </label>
                </div>

                <h4 style="margin: 0 0 15px 0; color: var(--gold); border-bottom: 1px solid #30475e; padding-bottom: 5px; font-size: 1.1rem;">Géneros (Escolhe 1 ou mais)</h4>
                
                <div id="filterGenres" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 25px; width: 100%;">
                    <label><input type="checkbox" value="28" class="filter-hidden-input"><span class="filter-tag">Ação</span></label>
                    <label><input type="checkbox" value="12" class="filter-hidden-input"><span class="filter-tag">Aventura</span></label>
                    <label><input type="checkbox" value="35" class="filter-hidden-input"><span class="filter-tag">Comédia</span></label>
                    <label><input type="checkbox" value="18" class="filter-hidden-input"><span class="filter-tag">Drama</span></label>
                    <label><input type="checkbox" value="16" class="filter-hidden-input"><span class="filter-tag">Animação</span></label>
                    <label><input type="checkbox" value="27" class="filter-hidden-input"><span class="filter-tag">Terror</span></label>
                    <label><input type="checkbox" value="878" class="filter-hidden-input"><span class="filter-tag">Ficção Científica</span></label>
                    <label><input type="checkbox" value="10749" class="filter-hidden-input"><span class="filter-tag">Romance</span></label>
                    <label><input type="checkbox" value="53" class="filter-hidden-input"><span class="filter-tag">Thriller</span></label>
                    <label><input type="checkbox" value="9648" class="filter-hidden-input"><span class="filter-tag">Mistério</span></label>
                    <label><input type="checkbox" value="14" class="filter-hidden-input"><span class="filter-tag">Fantasia</span></label>
                    <label><input type="checkbox" value="80" class="filter-hidden-input"><span class="filter-tag">Crime</span></label>
                    <label><input type="checkbox" value="10751" class="filter-hidden-input"><span class="filter-tag">Família</span></label>
                    <label><input type="checkbox" value="99" class="filter-hidden-input"><span class="filter-tag">Documentário</span></label>
                </div>

                <div style="display: flex; gap: 10px;">
                    <button id="btnApplyFilters" style="flex: 1; background: var(--gold); color: var(--bg); border: none; padding: 12px; font-weight: bold; border-radius: 5px; cursor: pointer; text-transform: uppercase;">Pesquisar</button>
                    <button id="btnClearFilters" style="background: #333; color: white; border: none; padding: 12px; font-weight: bold; border-radius: 5px; cursor: pointer;" title="Limpar Filtros">Limpar</button>
                </div>
            </div>
        </div>
        
        <a id="loginBtn" href="login.html" class="login-btn" style="text-decoration:none;">Entrar</a>

        <div id="profileArea" class="profile-container" style="display: none;">
            <img id="userAvatar" class="user-avatar" src="assets/img/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.webp" alt="Perfil" onclick="toggleProfileMenu()">            
            <div id="dropdownMenu" class="dropdown-menu">
                <div class="dropdown-header">Olá!</div>
                <a href="profile.html" class="dropdown-item">👤 O meu Perfil</a>
                <a href="plans.html" class="dropdown-item">💎 Os Meus Planos</a>
                <a href="history.html" class="dropdown-item">📜 Histórico</a>
                <div class="dropdown-divider"></div>
                <a href="#" id="btnLogoutOption" class="dropdown-item logout-item">🚪 Terminar Sessão</a>
            </div>
        </div>

      </div>
    </header>
  `;
}

export function sectionCardTemplate(item) {
  const title = item.title || item.name || "Sem título";
  const poster = item.poster || "https://placehold.co/200x300?text=Sem+Capa";
  
  return `
    <div class="card" onclick="openMovie(${item.tmdb_id || item.id}, '${item.type || item.media_type}')">
      <img src="${poster}" alt="${title}" loading="lazy">
      <div class="card-info">
        <h3>${title}</h3>
      </div>
    </div>
  `;
}