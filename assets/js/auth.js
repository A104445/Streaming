import { auth, signOut, onAuthStateChanged, db, ref, onValue } from "./firebase-config.js";

setTimeout(() => {
    // Selecionar elementos
    const loginBtn = document.getElementById("loginBtn");
    const profileArea = document.getElementById("profileArea"); // O contentor
    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const btnLogoutOption = document.getElementById("btnLogoutOption");

    // Se o header ainda não carregou, paramos
    if (!loginBtn) return;

    // --- 1. LÓGICA DE MOSTRAR/ESCONDER MENU ---
    if (userAvatar) {
        userAvatar.addEventListener("click", (e) => {
            e.stopPropagation(); // Impede que o clique feche o menu imediatamente
            dropdownMenu.classList.toggle("show");
        });
    }

    // Fechar o menu se clicar fora dele
    window.addEventListener("click", (e) => {
        if (dropdownMenu && !profileArea.contains(e.target)) {
            dropdownMenu.classList.remove("show");
        }
    });

    // --- 2. LÓGICA DE LOGOUT (OPÇÃO VERMELHA) ---
    if (btnLogoutOption) {
        btnLogoutOption.addEventListener("click", (e) => {
            e.preventDefault(); // Evita comportamento de link
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        });
    }

    // 3. ESTADO DO UTILIZADOR (AQUI ESTÁ A MUDANÇA DA FOTO)
    onAuthStateChanged(auth, (user) => {
        // Se os elementos ainda não existirem, não faz nada
        if (!loginBtn || !profileArea) return;

        if (user) {
            // --- UTILIZADOR LOGADO ---
            loginBtn.style.display = "none";
            profileArea.style.display = "block";

            // Tentar carregar foto da Base de Dados (Realtime DB)
            const avatarRef = ref(db, 'users/' + user.uid + '/avatar');
            
            onValue(avatarRef, (snapshot) => {
                const fotoDb = snapshot.val();
                if (userAvatar) {
                    if (fotoDb) {
                        userAvatar.src = fotoDb; // Usa a foto personalizada
                    } else {
                        // Se não tiver foto na DB, usa a do Google ou o boneco
                        userAvatar.src = user.photoURL || "assets/img/default-user.png";
                    }
                }
            });

        } else {
            // --- NÃO LOGADO ---
            loginBtn.style.display = "block";
            profileArea.style.display = "none";
            if (dropdownMenu) dropdownMenu.classList.remove("show");
        }
    });

}, 500);