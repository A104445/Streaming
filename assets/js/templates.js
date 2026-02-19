export function headerTemplate() {
  return `
    <header class="header">
      <div class="logo" onclick="window.location.href='index.html'">Picote<span style="color: white;">Flix</span></div>
      
      <div class="nav-center">
          <button class="nav-icon active" onclick="filtrarCategoria('all', this)" title="Início">🏠</button>
          <button class="nav-icon" onclick="filtrarCategoria('movie', this)" title="Apenas Filmes">Filmes</button>
          <button class="nav-icon" onclick="filtrarCategoria('tv', this)" title="Apenas Séries">Séries</button>
      </div>

      <div class="header-right">
        
        <input id="searchInput" type="text" placeholder="Pesquisar...">
        
        <a id="loginBtn" href="login.html" class="login-btn" style="text-decoration:none;">Entrar</a>

        <div id="profileArea" class="profile-container" style="display: none;">
            <img id="userAvatar" class="user-avatar" src="assets/img/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.webp" alt="Perfil" onclick="toggleProfileMenu()">            
            <div id="dropdownMenu" class="dropdown-menu">
                <div class="dropdown-header">Olá!</div>
                <a href="profile.html" class="dropdown-item">O meu Perfil</a>
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
  // Fallback para imagem se não existir
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