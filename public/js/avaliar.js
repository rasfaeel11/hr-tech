const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

// 1. Carregar lista de funcionários no SELECT
async function carregarSelectFuncionarios() {
    try {
        const response = await fetch('/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await response.json();
        
        const select = document.getElementById('selectFuncionario');
        select.innerHTML = '<option value="">Selecione um funcionário...</option>';

        usuarios.forEach(u => {
            // Só mostra ativos e não mostra a si mesmo (opcional, mas boa prática)
            // Para simplificar, vamos mostrar todo mundo.
            if (u.ativo !== false) {
                const option = document.createElement('option');
                option.value = u.id;
                option.textContent = `${u.nome_completo} (${u.cargo})`;
                select.appendChild(option);
            }
        });

    } catch (error) {
        console.error(error);
        alert('Erro ao carregar lista de funcionários.');
    }
}

// 2. Enviar Avaliação
document.getElementById('formAvaliacao').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Montar o Objeto Complexo que o Back-end espera
    const payload = {
        avaliado_id: document.getElementById('selectFuncionario').value,
        tipo: document.getElementById('tipoAvaliacao').value,
        periodo: document.getElementById('periodo').value,
        itens: [
            {
                competencia: 'Habilidade Técnica',
                nota: Number(document.getElementById('nota1').value),
                comentario: document.getElementById('obs1').value
            },
            {
                competencia: 'Trabalho em Equipe',
                nota: Number(document.getElementById('nota2').value),
                comentario: document.getElementById('obs2').value
            },
            {
                competencia: 'Proatividade',
                nota: Number(document.getElementById('nota3').value),
                comentario: document.getElementById('obs3').value
            }
        ]
    };

    try {
        const response = await fetch('/avaliacoes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Avaliação registrada com sucesso!');
            window.location.href = '/dashboard.html'; // Volta pro dashboard pra ver o gráfico mudar
        } else {
            const erro = await response.json();
            alert('Erro: ' + (erro.error || 'Falha ao salvar'));
        }

    } catch (error) {
        console.error(error);
        alert('Erro de conexão.');
    }
});

// Inicia
carregarSelectFuncionarios();