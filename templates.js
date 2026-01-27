export function headerTemplate() {
  return `
    <header class="header">
      <div class="logo">Picote<span style="color: white;">Flix</span></div>
      <input id="searchInput" type="text" placeholder="Pesquisar em PicoteFlix...">
    </header>
  `;
}

export function sectionCardTemplate(item) {
  // ... (O resto da função mantém-se igual)
  const title = item.title || item.name || "Sem título";
  
  return `
    <div class="card" onclick="openMovie(${item.tmdb_id || item.id}, '${item.type || item.media_type}')">
      <img src="${item.poster}" alt="${title}" loading="lazy">
      <div class="card-info">
        <h3>${title}</h3>
      </div>
    </div>
  `;
}