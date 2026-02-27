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

        // --- MODO VIP: TEMA DA PRIMA 🌸 ---
        // (Só executa se alguém estiver logado e se o email for o dela)
        const emailDaPrima = "marquesmariaines2@gmail.com"; 
        
        if (user.email === emailDaPrima) {
            // Muda o fundo para o degradê rosa
            document.body.style.background = "linear-gradient(to bottom, #ad1457, #4a0024)";
            document.body.style.backgroundAttachment = "fixed";

            // Muda a cor das letras para se conseguir ler
            document.body.style.color = "#1a1a1a";

            // Muda o cabeçalho lá de cima
            const header = document.querySelector(".header");
            if (header) {
                header.style.background = "#880e4f"; 
                header.style.borderBottom = "2px solid #310014";
            }
            
            console.log("🌸 Modo VIP ativado!");
        }
        // ----------------------------------

    } else {
        // Ninguém tem sessão iniciada
        if (loginBtn) loginBtn.style.display = "block";
        if (profileArea) profileArea.style.display = "none";
        
        // Se a prima fizer logout, podemos querer limpar o rosa (volta ao estilo padrão do CSS)
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