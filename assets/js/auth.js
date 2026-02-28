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

// 2. OUVINTE DE ESTADO DE AUTENTICAÇÃO (O "Olheiro" do Firebase)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Utilizador com sessão iniciada
        if (loginBtn) loginBtn.style.display = "none";
        if (profileArea) profileArea.style.display = "block";
        
        // Opcional: Colocar a foto de perfil do Google se existir
        if (user.photoURL && userAvatar) {
            userAvatar.src = user.photoURL;
        }

        // =========================================================
        // --- NOVO SISTEMA DE CONTAS VIP (Cores Personalizadas) ---
        // =========================================================
        const vipThemes = {
            "marquesmariaines2@gmail.com": {
                // Tema Turquesa (Prima)
                fundo: "linear-gradient(to bottom, #00796b, #00695c)", 
                cabecalho: "#004d40",
                borda: "#00251a",
                texto: "#ffffff"
            },
            "mariapmoreira006@gmail.com": { 
                // Tema Rosa
                fundo: "linear-gradient(to bottom, #ad1457, #4a0024)", 
                cabecalho: "#880e4f",
                borda: "#310014",
                texto: "#ffffff"
            },
            "caroliinapinto12@gmail.com": {
                fundo: "linear-gradient(to bottom, #1b5e20, #003300)", 
                cabecalho: "#0a3d0a",
                borda: "#001a00",
                texto: "#ffffff"
            }
        };

        const userTheme = vipThemes[user.email];

        if (userTheme) {
            // Aplica as cores VIP
            document.body.style.background = userTheme.fundo;
            document.body.style.backgroundAttachment = "fixed";
            document.body.style.color = userTheme.texto;

            const header = document.querySelector(".header");
            if (header) {
                header.style.background = userTheme.cabecalho; 
                header.style.borderBottom = `2px solid ${userTheme.borda}`;
            }
            console.log("✨ Tema personalizado carregado para: " + user.email);
            
        } else {
            // Se NÃO for VIP, garante as cores originais do site
            document.body.style.background = "";
            document.body.style.color = "";
            const header = document.querySelector(".header");
            if (header) {
                header.style.background = "";
                header.style.borderBottom = "";
            }
        }
        // =========================================================

    } else {
        // Ninguém tem sessão iniciada
        if (loginBtn) loginBtn.style.display = "block";
        if (profileArea) profileArea.style.display = "none";
        
        // Limpa as cores quando alguém faz logout
        document.body.style.background = "";
        document.body.style.color = "";
        const header = document.querySelector(".header");
        if (header) {
            header.style.background = "";
            header.style.borderBottom = "";
        }
    }
});

}, 500);