import { db, ref, set, get, remove, child, auth } from "./firebase-config.js";

// --- FUNÇÃO AUXILIAR: CRIA O CAMINHO NA BD ---
function getPath(uid, type, movieId, category) {
    return `users/${uid}/${category}/${type}_${movieId}`;
}

// --- FUNÇÃO AUXILIAR: MOSTRAR MODAL DE LOGIN ---
function showLoginModal() {
    const modal = document.getElementById('loginRequiredModal');
    if (modal) {
        modal.style.display = 'flex'; // Abre o modal bonito
    } else {
        // Prevenção caso o HTML do modal não esteja na página
        alert("🔒 Precisas de iniciar sessão para usar esta funcionalidade.");
        window.location.href = "login.html";
    }
}

/**
 * 1. MARCAR COMO VISTO (Histórico)
 */
export async function toggleVisto(filme) {
    const user = auth.currentUser;
    if (!user) {
        showLoginModal();
        return false;
    }

    const path = getPath(user.uid, filme.type, filme.id, 'history');
    const dbRef = ref(db, path);

    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
        await remove(dbRef);
        return false;
    } else {
        await set(dbRef, {
            id: filme.id,
            title: filme.title || filme.name,
            poster: filme.poster_path,
            type: filme.type,
            genres: filme.genres || [],
            timestamp: Date.now()
        });
        return true;
    }
}

/**
 * 2. MARCAR COMO GOSTO (Likes)
 */
export async function toggleGosto(filme) {
    const user = auth.currentUser;
    if (!user) {
        showLoginModal();
        return false;
    }

    const path = getPath(user.uid, filme.type, filme.id, 'likes');
    const dbRef = ref(db, path);

    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
        await remove(dbRef);
        return false;
    } else {
        await set(dbRef, {
            id: filme.id,
            title: filme.title || filme.name,
            poster: filme.poster_path,
            type: filme.type,
            genres: filme.genres || [],
            timestamp: Date.now()
        });
        return true;
    }
}

/**
 * 3. VERIFICAR ESTADO (Botões)
 */
export async function verificarEstado(type, id) {
    const user = auth.currentUser;
    if (!user) return { visto: false, gosto: false, later: false };

    const uid = user.uid;
    const [histSnap, likeSnap, laterSnap] = await Promise.all([
        get(ref(db, `users/${uid}/history/${type}_${id}`)),
        get(ref(db, `users/${uid}/likes/${type}_${id}`)),
        get(ref(db, `users/${uid}/watchLater/${type}_${id}`))
    ]);

    return {
        visto: histSnap.exists(),
        gosto: likeSnap.exists(),
        later: laterSnap.exists()
    };
}

/**
 * 4. OBTER LISTA NEGRA (Vistos + Likes)
 */
export async function getWatchedIds() {
    const user = auth.currentUser;
    if (!user) return { movie: [], tv: [] };

    try {
        const [histSnap, likeSnap] = await Promise.all([
            get(child(ref(db), `users/${user.uid}/history`)),
            get(child(ref(db), `users/${user.uid}/likes`))
        ]);

        const ignoredIds = { movie: new Set(), tv: new Set() };

        const processar = (snapshot) => {
            if (snapshot.exists()) {
                Object.values(snapshot.val()).forEach(item => {
                    if (item.type === 'movie') ignoredIds.movie.add(String(item.id));
                    if (item.type === 'tv') ignoredIds.tv.add(String(item.id));
                });
            }
        };

        processar(histSnap);
        processar(likeSnap);

        return {
            movie: Array.from(ignoredIds.movie),
            tv: Array.from(ignoredIds.tv)
        };

    } catch (error) {
        console.error("Erro ao obter histórico:", error);
        return { movie: [], tv: [] };
    }
}

/**
 * 5. DESCOBRIR GÉNERO FAVORITO
 */
export async function getTopGenre(category, type) {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const snapshot = await get(child(ref(db), `users/${user.uid}/${category}`));
        if (!snapshot.exists()) return null;

        const allItems = Object.values(snapshot.val());
        const filteredItems = allItems.filter(item => item.type === type);
        if (filteredItems.length === 0) return null;

        const genreCounts = {};
        filteredItems.forEach(item => {
            if (item.genres && Array.isArray(item.genres)) {
                item.genres.forEach(genreId => {
                    genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
                });
            }
        });

        const sortedGenres = Object.entries(genreCounts).sort(([, a], [, b]) => b - a);
        if (sortedGenres.length > 0) return sortedGenres[0][0];
        return null;
    } catch (error) { return null; }
}

/**
 * 6. WATCH LATER (Relógio)
 */
export async function toggleVerMaisTarde(filme) {
    const user = auth.currentUser;
    if (!user) {
        showLoginModal();
        return false;
    }

    const path = `users/${user.uid}/watchLater/${filme.type}_${filme.id}`;
    const dbRef = ref(db, path);
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
        await remove(dbRef);
        return false;
    } else {
        await set(dbRef, {
            id: filme.id,
            title: filme.title || filme.name,
            poster: filme.poster_path,
            type: filme.type,
            timestamp: Date.now()
        });
        return true;
    }
}

export async function getWatchLaterList(type) {
    const user = auth.currentUser;
    if (!user) return [];
    try {
        const snapshot = await get(child(ref(db), `users/${user.uid}/watchLater`));
        if (!snapshot.exists()) return [];
        return Object.values(snapshot.val())
            .filter(item => item.type === type)
            .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) { return []; }
}

/**
 * 7. HISTÓRICO COMPLETO
 */
export async function getFullHistory(category) {
    const user = auth.currentUser;
    if (!user) return { movie: [], tv: [] };
    try {
        const snapshot = await get(child(ref(db), `users/${user.uid}/${category}`));
        if (!snapshot.exists()) return { movie: [], tv: [] };
        const allItems = Object.values(snapshot.val());
        return {
            movie: allItems.filter(i => i.type === 'movie').sort((a, b) => b.timestamp - a.timestamp),
            tv: allItems.filter(i => i.type === 'tv').sort((a, b) => b.timestamp - a.timestamp)
        };
    } catch (error) { return { movie: [], tv: [] }; }
}

/**
 * 8. PROGRESSO DE SÉRIES (Continuar a Ver)
 */
export async function saveProgress(id, season, episode) {
    const user = auth.currentUser;
    if (!user) return; // Se não tiver conta, não faz nada
    
    const dbRef = ref(db, `users/${user.uid}/progress/tv_${id}`);
    
    // 1. LER O PROGRESSO ATUAL PRIMEIRO
    const snapshot = await get(dbRef);
    let deveGravar = true;

    if (snapshot.exists()) {
        const progressoAtual = snapshot.val();
        
        const sAtual = parseInt(progressoAtual.season);
        const eAtual = parseInt(progressoAtual.episode);
        const sNovo = parseInt(season);
        const eNovo = parseInt(episode);

        // 2. LÓGICA DE COMPARAÇÃO:
        // Se a temporada nova for mais antiga, NÃO GRAVA.
        if (sNovo < sAtual) {
            deveGravar = false;
        } 
        // Se for a mesma temporada, mas um episódio igual ou mais antigo, NÃO GRAVA.
        else if (sNovo === sAtual && eNovo <= eAtual) {
            deveGravar = false;
        }
    }

    // 3. SE FOR MAIS AVANÇADO (ou se for a primeira vez), GRAVA!
    if (deveGravar) {
        await set(dbRef, {
            season: parseInt(season),
            episode: parseInt(episode),
            timestamp: Date.now()
        });
    }
}

export async function getProgress(id) {
    const user = auth.currentUser;
    if (!user) return null;

    const snapshot = await get(ref(db, `users/${user.uid}/progress/tv_${id}`));
    if (snapshot.exists()) {
        return snapshot.val();
    }
    return null;
}