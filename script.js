const API_URL = "https://vidsrc-embed.ru/movies/latest/page-1.json";

async function carregarFilmes() {
  const res = await fetch(API_URL);
  const data = await res.json();

  const lista = document.getElementById("lista");
  const player = document.getElementById("player");

  data.result.forEach(filme => {
    const div = document.createElement("div");
    div.className = "filme";

    div.innerHTML = `
      <strong>${filme.title}</strong><br>
      <span class="quality">${filme.quality}</span>
    `;

    div.onclick = () => {
      player.src = filme.embed_url;
    };

    lista.appendChild(div);
  });
}

carregarFilmes();
