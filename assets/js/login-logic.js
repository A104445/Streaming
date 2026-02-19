import { 
    auth, provider, signInWithPopup, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, updateProfile, sendEmailVerification, 
    signOut, setPersistence, browserLocalPersistence, browserSessionPersistence,
    sendPasswordResetEmail, // <--- Importante para recuperar pass
    db, ref, set // <--- Importantes para guardar o avatar
} from "./firebase-config.js";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const recoverForm = document.getElementById("recover-form");

// --- 1. LOGIN ---
if(loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const pass = document.getElementById("loginPass").value;
        const remember = document.getElementById("rememberMe").checked;
        const errorMsg = document.getElementById("loginError");

        try {
            errorMsg.style.display = "none";
            await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            
            // Verificar email
            if (!userCredential.user.emailVerified) {
                await signOut(auth);
                throw new Error("email-not-verified");
            }

            window.location.href = "index.html"; 

        } catch (error) {
            errorMsg.style.display = "block";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                errorMsg.innerText = "Credenciais inválidas.";
            } else if (error.message === "email-not-verified") {
                errorMsg.innerText = "Email não verificado! Verifica a tua caixa de entrada.";
            } else {
                errorMsg.innerText = "Erro: " + error.code;
            }
        }
    });
}

// --- 2. REGISTO (COM AVATAR AUTOMÁTICO) ---
if(registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("regName").value;
        const email = document.getElementById("regEmail").value;
        const pass = document.getElementById("regPass").value;
        const confirm = document.getElementById("regConfirmPass").value;
        const errorMsg = document.getElementById("regError");

        errorMsg.style.display = "none";

        if (pass !== confirm) {
            errorMsg.style.display = "block";
            errorMsg.innerText = "As passwords não coincidem!";
            return;
        }

        try {
            // A. Criar Utilizador
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // B. Atualizar Nome no Auth
            await updateProfile(user, { displayName: name });

            // C. GERAR AVATAR E GUARDAR NA BD
            // Gera um avatar com a inicial do nome e fundo aleatório
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true`;
            
            // Guarda na base de dados para o auth.js conseguir ler depois
            await set(ref(db, 'users/' + user.uid), {
                username: name,
                email: email,
                avatar: avatarUrl,
                createdAt: Date.now()
            });

            // D. Enviar Email de Verificação
            await sendEmailVerification(user);
            
            // Mostrar Modal de Sucesso
            const modal = document.getElementById('emailModal');
            if (modal) modal.style.display = 'flex';
            else alert("Conta criada! Verifica o teu email.");

            // Logout para obrigar a verificar
            await signOut(auth);

            // Limpar Campos
            document.getElementById("regEmail").value = "";
            document.getElementById("regPass").value = "";
            document.getElementById("regConfirmPass").value = "";
            document.getElementById("regName").value = "";

        } catch (error) {
            errorMsg.style.display = "block";
            if (error.code === 'auth/email-already-in-use') {
                errorMsg.innerText = "Este email já está registado.";
            } else if (error.code === 'auth/weak-password') {
                errorMsg.innerText = "Password muito fraca.";
            } else {
                errorMsg.innerText = "Erro: " + error.code;
            }
        }
    });
}

// --- 3. RECUPERAR PASSWORD (ATUALIZADO) ---
if(recoverForm) {
    recoverForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("recEmail").value;
        const errorMsg = document.getElementById("recError");

        try {
            if(errorMsg) errorMsg.style.display = "none";
            
            // 1. Enviar Email
            await sendPasswordResetEmail(auth, email);
            
            // 2. Mostrar o Modal Personalizado (Em vez do alert)
            const modal = document.getElementById('recoverModal');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                // Caso te esqueças de meter o HTML, usa o alert como segurança
                alert("Email enviado! Verifica a tua caixa de entrada.");
                document.querySelector("span[onclick='showLogin()']").click();
            }

        } catch (error) {
            if(errorMsg) {
                errorMsg.style.display = "block";
                if (error.code === 'auth/user-not-found') {
                    errorMsg.innerText = "Não existe conta com esse email.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMsg.innerText = "Email inválido.";
                } else {
                    errorMsg.innerText = "Erro: " + error.code;
                }
            } else {
                alert("Erro: " + error.message);
            }
        }
    });
}

// --- 4. GOOGLE ---
const btnGoogle = document.getElementById("btnGoogleLogin");
if(btnGoogle) {
    btnGoogle.addEventListener("click", async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
            // O avatar do Google é gerido automaticamente no auth.js
            window.location.href = "index.html";
        } catch (e) { console.error(e); }
    });
}