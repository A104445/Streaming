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
        const emailDaPrima = "alexandre.marques.98765@gmail.com"; 
        
        if (user.email === emailDaPrima) {
            // Descobre o dia de hoje
            const diaHoje = new Date().getDate();
            const diaEPar = (diaHoje % 2 === 0);

            let corFundo, corCabecalho, corBorda;

            if (diaEPar) {
                // --- DIAS PARES (ROSA) ---
                // Cabeçalho muito escuro (Vinho), Fundo um pouco mais claro (Rosa Forte)
                corCabecalho = "#880e4f"; 
                corBorda = "#4a0024";
                corFundo = "linear-gradient(to bottom, #c2185b, #ad1457)"; 
            } else {
                // --- DIAS ÍMPARES (TURQUESA) ---
                // Cabeçalho muito escuro (Teal Profundo), Fundo um pouco mais claro (Turquesa Forte)
                corCabecalho = "#004d40"; 
                corBorda = "#00251a";
                corFundo = "linear-gradient(to bottom, #00796b, #00695c)"; 
            }

            // 1. Aplica o fundo dinâmico
            document.body.style.background = corFundo;
            document.body.style.backgroundAttachment = "fixed";
            
            // 2. Cor das letras (Branco puro para contraste máximo nos títulos)
            document.body.style.color = "#ffffff";

            // 3. Aplica o cabeçalho escuro
            const header = document.querySelector(".header");
            if (header) {
                header.style.background = corCabecalho; 
                header.style.borderBottom = `2px solid ${corBorda}`;
            }
            
            console.log(`✨ Modo VIP ativado! Dia ${diaHoje}: Tema ${diaEPar ? 'Rosa' : 'Turquesa'}.`);
        }

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