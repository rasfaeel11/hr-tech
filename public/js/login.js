const form = document.getElementById('loginForm');
const msgErro = document.getElementById('msgErro');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const botao = form.querySelector('button');

    botao.textContent = 'Entrando...';
    botao.disabled = true;
    msgErro.style.display = 'none';

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        // --- MUDANÇA AQUI: Ler como texto primeiro para ver o que veio ---
        const textoResposta = await response.text(); 
        console.log("Resposta bruta do servidor:", textoResposta); // Olha o F12 > Console

        // Tenta converter o texto para JSON
        let data;
        try {
            data = JSON.parse(textoResposta);
        } catch (e) {
            // Se falhar, é porque o servidor mandou HTML ou Texto puro (erro feio)
            throw new Error(`Erro técnico: O servidor não respondeu JSON. Resposta: ${textoResposta}`);
        }

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } else {
            throw new Error(data.error || 'Erro ao fazer login');
        }

    } catch (error) {
        console.error(error);
        msgErro.textContent = error.message; // Agora vai aparecer o erro real na tela
        msgErro.style.display = 'block';
    } finally {
        botao.textContent = 'ENTRAR';
        botao.disabled = false;
    }
});