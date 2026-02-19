import { 
    auth, 
    signOut, 
    onAuthStateChanged, 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    updatePassword,
    updateProfile,
    db,
    ref, 
    set,
    onValue
} from "./firebase-config.js";

// Elementos do Perfil
const pName = document.getElementById("p-name");
const pEmail = document.getElementById("p-email");
const pUid = document.getElementById("p-uid");
const pAvatar = document.getElementById("p-avatar");
const btnLogout = document.getElementById("btnLogout");
const btnChangePhoto = document.getElementById("btnChangePhoto");
const btnRemovePhoto = document.getElementById("btnRemovePhoto"); 
const deletePhotoModal = document.getElementById("deletePhotoModal");
const btnConfirmDeletePhoto = document.getElementById("btnConfirmDeletePhoto");
const fileInput = document.getElementById("fileInput");
const uploadMsg = document.getElementById("uploadMsg");

// Elementos da Password
const btnShowPassForm = document.getElementById("btnShowPassForm");
const passForm = document.getElementById("passForm");
const passRowDisplay = document.getElementById("passRowDisplay");
const btnCancelPass = document.getElementById("btnCancelPass");
const btnSavePass = document.getElementById("btnSavePass");
const currentPassInput = document.getElementById("currentPass");
const newPassInput = document.getElementById("newPass");
const passMsg = document.getElementById("passMsg");

let currentUser = null;

// 1. CARREGAR DADOS DO UTILIZADOR
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        pName.innerText = user.displayName || "Sem Nome";
        pEmail.innerText = user.email;
        pUid.innerText = user.uid;
        
        const avatarRef = ref(db, 'users/' + user.uid + '/avatar');
        
        onValue(avatarRef, (snapshot) => {
            const fotoTexto = snapshot.val();
            if (fotoTexto) {
                pAvatar.src = fotoTexto; // Se existir na DB, usa essa
            } else {
                pAvatar.src = "assets/img/default-user.png"; // Senão, usa a padrão
            }
        });

        // Se for conta Google, esconde a opção de password (pois não existe)
        if (user.providerData.some(provider => provider.providerId === "google.com")) {
            const passContainer = document.querySelector(".pass-row").parentElement;
            if(passContainer) passContainer.style.display = "none";
        }
    } else {
        window.location.href = "login.html";
    }
});

// 2. TERMINAR SESSÃO
if(btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).then(() => window.location.href = "index.html");
    });
}

// 3. UPLOAD DA FOTO (SEM STORAGE)
if(btnChangePhoto) {
    btnChangePhoto.addEventListener("click", () => fileInput.click());
}

// ======================================================
// 3.5 REMOVER FOTO (COM MODAL PERSONALIZADO)
// ======================================================

// A. Mostrar o modal quando clica no botão do Lixo
if(btnRemovePhoto) {
    btnRemovePhoto.addEventListener("click", () => {
        if(deletePhotoModal) deletePhotoModal.style.display = "flex";
    });
}

// B. Ação quando o utilizador confirma no Modal ("Sim, apagar")
if(btnConfirmDeletePhoto) {
    btnConfirmDeletePhoto.addEventListener("click", () => {
        
        if(uploadMsg) {
            uploadMsg.style.display = "block";
            uploadMsg.innerText = "A remover...";
        }
        
        // 1. Gerar a inicial de novo
        const nome = currentUser.displayName || "User";
        const avatarInicialUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random&color=fff&size=128&bold=true`;
        
        // 2. Gravar na Base de Dados
        set(ref(db, 'users/' + currentUser.uid + '/avatar'), avatarInicialUrl)
            .then(() => {
                if(uploadMsg) {
                    uploadMsg.innerText = "Foto removida com sucesso!";
                    setTimeout(() => uploadMsg.style.display = "none", 2000);
                }
                // Esconder a janela depois de apagar
                if(deletePhotoModal) deletePhotoModal.style.display = "none";
            })
            .catch((error) => {
                if(uploadMsg) {
                    uploadMsg.innerText = "Erro ao remover a foto.";
                    uploadMsg.style.color = "#ff6b6b";
                }
                console.error("Erro ao remover foto: ", error);
                // Esconder a janela mesmo se der erro
                if(deletePhotoModal) deletePhotoModal.style.display = "none";
            });
    });
}

if(fileInput) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if(uploadMsg) {
            uploadMsg.style.display = "block";
            uploadMsg.innerText = "A processar...";
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                // --- ENCOLHER IMAGEM (Obrigatório para ser grátis) ---
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const MAX_WIDTH = 150; // Tamanho máximo 150px
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Converter para Texto
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

                // Guardar na Base de Dados
                set(ref(db, 'users/' + currentUser.uid + '/avatar'), dataUrl)
                    .then(() => {
                        if(uploadMsg) uploadMsg.innerText = "Guardado!";
                        setTimeout(() => uploadMsg.style.display = "none", 2000);
                    });
            };
        };
        reader.readAsDataURL(file);
    });
}

// ======================================================
// 4. LÓGICA DE ALTERAR PASSWORD (SEM POPUP)
// ======================================================

// ... (imports e resto do código mantêm-se) ...

// --- VARIÁVEL PARA O NOVO CAMPO DE CONFIRMAÇÃO ---
const confirmNewPassInput = document.getElementById("confirmNewPass"); 

// A. Mostrar Formulário (Limpa tudo)
if(btnShowPassForm) {
    btnShowPassForm.addEventListener("click", () => {
        passForm.style.display = "block";
        passRowDisplay.style.display = "none";
        passMsg.style.display = "none";
        // Limpar os 3 campos
        if(currentPassInput) currentPassInput.value = "";
        if(newPassInput) newPassInput.value = "";
        if(confirmNewPassInput) confirmNewPassInput.value = "";
    });
}

// B. Cancelar
if(btnCancelPass) {
    btnCancelPass.addEventListener("click", () => {
        passForm.style.display = "none";
        passRowDisplay.style.display = "flex";
    });
}

// C. Guardar (Com correção de erros)
if(btnSavePass) {
    btnSavePass.addEventListener("click", async () => {
        const oldPass = currentPassInput.value;
        const newPass = newPassInput.value;
        const confPass = confirmNewPassInput.value;

        // 1. Validar se preencheu tudo
        if (!oldPass || !newPass || !confPass) {
            mostrarErro("Preenche todos os campos.");
            return;
        }

        // 2. Validar se as novas são iguais
        if (newPass !== confPass) {
            mostrarErro("As novas passwords não coincidem!");
            return;
        }

        // 3. Validar tamanho
        if (newPass.length < 6) {
            mostrarErro("A password deve ter pelo menos 6 caracteres.");
            return;
        }

        // Mensagem de "A carregar..."
        passMsg.style.display = "block";
        passMsg.innerText = "A verificar...";
        passMsg.style.color = "#d4af37"; // Dourado

        try {
            // Tenta re-autenticar com a password antiga
            const credential = EmailAuthProvider.credential(currentUser.email, oldPass);
            await reauthenticateWithCredential(currentUser, credential);

            // Se passou, atualiza para a nova
            await updatePassword(currentUser, newPass);

            // SUCESSO!
            passMsg.innerText = "Password alterada com sucesso!";
            passMsg.style.color = "#4ade80"; // Verde
            
            setTimeout(() => {
                passForm.style.display = "none";
                passRowDisplay.style.display = "flex";
            }, 2000);

        } catch (error) {
            console.error("Erro Password:", error.code); // Para veres na consola se necessário
            passMsg.style.color = "#ff6b6b"; // Vermelho

            // --- AQUI ESTÁ A CORREÇÃO DO ERRO ---
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                passMsg.innerText = "A password atual está incorreta.";
            } else if (error.code === 'auth/weak-password') {
                passMsg.innerText = "A nova password é muito fraca.";
            } else if (error.code === 'auth/too-many-requests') {
                passMsg.innerText = "Muitas tentativas falhadas. Tenta mais tarde.";
            } else {
                // Se for outro erro qualquer, mostra o código para sabermos o que é
                passMsg.innerText = "Erro: " + error.code;
            }
        }
    });
}

function mostrarErro(texto) {
    passMsg.style.display = "block";
    passMsg.innerText = texto;
    passMsg.style.color = "#ff6b6b";
}

// Função auxiliar para mensagens no formulário
function mostrarMsg(texto, cor) {
    passMsg.style.display = "block";
    passMsg.style.color = cor;
    passMsg.innerText = texto;
}