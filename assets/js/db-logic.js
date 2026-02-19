import { db, ref, set, get, remove, child, auth } from "./firebase-config.js";

// --- FUNÇÃO AUXILIAR: CRIA O CAMINHO NA BD ---
function getPath(uid, type, movieId, category) {
    return `users/${uid}/${category}/${type}_${movieId}`;
}

/**
 * 1. MARCAR COMO VISTO (Histórico)
 */
export async function toggleVisto(filme) {
    const user = auth.currentUser;
    if (!user) return alert("Faz login para guardar o histórico!");

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
    if (!user) return alert("Faz login para dar Like!");

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
 * 4. OBTER LISTA NEGRA (Vistos + Likes) - ATUALIZADO
 * Agora busca Vistos E Likes para não recomendar nada que já conheças.
 */
export async function getWatchedIds() {
    const user = auth.currentUser;
    if (!user) return { movie: [], tv: [] };

    try {
        // Busca Vistos e Likes ao mesmo tempo
        const [histSnap, likeSnap] = await Promise.all([
            get(child(ref(db), `users/${user.uid}/history`)),
            get(child(ref(db), `users/${user.uid}/likes`))
        ]);

        // Usamos um Set para não haver duplicados e convertemos tudo para String
        const ignoredIds = { movie: new Set(), tv: new Set() };

        const processar = (snapshot) => {
            if (snapshot.exists()) {
                Object.values(snapshot.val()).forEach(item => {
                    // Força o ID a ser Texto (String) para comparar bem depois
                    if (item.type === 'movie') ignoredIds.movie.add(String(item.id));
                    if (item.type === 'tv') ignoredIds.tv.add(String(item.id));
                });
            }
        };

        processar(histSnap);
        processar(likeSnap);

        // Converte de volta para Array
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
    if (!user) return alert("Faz login!");

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