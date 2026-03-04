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

// ==========================================
// AUTO-AJUSTE DO CABEÇALHO GLOBAL (Para todas as páginas)
// ==========================================
function ajustarEspacoCabecalho() {
    const header = document.querySelector('.header');
    if (header) {
        // Mede a altura exata do cabeçalho
        const alturaCabecalho = header.offsetHeight;
        // Empurra a página para baixo com essa medida (+20px de margem)
        document.body.style.paddingTop = (alturaCabecalho + 20) + 'px';
    }
}

// 1. Tenta ajustar logo (com um ligeiro atraso para dar tempo de desenhar o HTML)
setTimeout(ajustarEspacoCabecalho, 100);

// 2. Garante o ajuste quando a página acaba de carregar totalmente
window.addEventListener('load', ajustarEspacoCabecalho);

// 3. Reajusta se a pessoa virar o telemóvel na horizontal ou redimensionar a janela
window.addEventListener('resize', ajustarEspacoCabecalho);

// ==========================================
// LÓGICA DO POP-UP DE INSTALAÇÃO DA PWA
// ==========================================
let deferredPrompt; // Variável para guardar o evento secreto do navegador
const installModal = document.getElementById('installAppModal');
const installBtn = document.getElementById('btnInstallConfirm');

// 1. O navegador avisa que a App cumpre os requisitos para ser instalada
window.addEventListener('beforeinstallprompt', (e) => {
    // Impede o navegador de mostrar aquela mini-barra chata no fundo do ecrã
    e.preventDefault();
    // Guarda o evento na nossa variável para usarmos depois
    deferredPrompt = e;
    
    // Mostra o nosso Pop-up bonito (se ele estiver nesta página)
    if (installModal) {
        // Mostramos com 'flex' porque é assim que os teus modals estão centrados no CSS
        installModal.style.display = 'flex'; 
    }
});

// 2. Quando o utilizador clica no nosso botão vermelho "Instalar Agora"
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        // Esconde o nosso pop-up
        installModal.style.display = 'none';
        
        // Dispara a janela OFICIAL de instalação do telemóvel (aquela do sistema)
        deferredPrompt.prompt();
        
        // Espera para ver se a pessoa clicou em "Aceitar" ou "Cancelar" na janela do sistema
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resultado da instalação: ${outcome}`);
        
        // Limpa a variável porque já não pode ser usada novamente
        deferredPrompt = null;
    });
}

// 3. (Opcional) Se a pessoa instalar com sucesso, podemos agradecer!
window.addEventListener('appinstalled', () => {
    console.log('Parabéns! O PicoteFlix foi instalado com sucesso!');
    // Podes esconder o pop-up aqui por precaução
    if (installModal) installModal.style.display = 'none';
});

}, 500);