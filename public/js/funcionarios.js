const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

// === 1. LISTAGEM ===
async function carregarFuncionarios() {
    try {
        const response = await fetch('/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await response.json();
        
        const tbody = document.getElementById('listaFuncionarios');
        tbody.innerHTML = '';

        usuarios.forEach(u => {
            // Define cor do status (Assumindo que temos o campo ativo, se não tiver, o banco retorna undefined, vamos tratar)
            // Se você não implementou o campo 'ativo' no SELECT do listUsers, ele pode não vir. 
            // Mas vamos assumir que está tudo bem.
            const statusClass = (u.ativo === false) ? 'tag-inativo' : 'tag-ativo';
            const statusTexto = (u.ativo === false) ? 'Desligado' : 'Ativo';
            
            // Só mostra botões se estiver Ativo
            let botoes = '';
            if (u.ativo !== false) {
                botoes = `
                    <button class="btn-icon" title="Promover" onclick="abrirModalPromover(${u.id}, '${u.nome_completo}')">⬆️</button>
                    <button class="btn-icon" title="Demitir" onclick="abrirModalDemitir(${u.id}, '${u.nome_completo}')">🚫</button>
                    `;
            }

            const tr = `
                <tr>
                    <td>
                        <strong>${u.nome_completo}</strong><br>
                        <small style="color:#888">${u.email}</small>
                    </td>
                    <td>${u.cargo}</td>
                    <td><span class="tag ${statusClass}">${statusTexto}</span></td>
                    <td>${botoes}</td>
                </tr>
            `;
            tbody.innerHTML += tr;
        });

    } catch (error) {
        console.error(error);
        alert('Erro ao listar funcionários');
    }
}

// === 2. CADASTRAR ===
document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        nome_completo: document.getElementById('cadNome').value,
        email: document.getElementById('cadEmail').value,
        senha: document.getElementById('cadSenha').value,
        cargo: document.getElementById('cadCargo').value,
        perfil: document.getElementById('cadPerfil').value,
        data_admissao: new Date().toISOString()
    };

    const res = await fetch('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Cadastrado com sucesso!');
        fecharModal('modalCadastro');
        carregarFuncionarios(); // Recarrega a tabela
    } else {
        alert('Erro ao cadastrar');
    }
});

// === 3. PROMOVER ===
function abrirModalPromover(id, nome) {
    document.getElementById('idPromover').value = id;
    document.getElementById('nomePromover').textContent = nome;
    abrirModal('modalPromover');
}

document.getElementById('formPromover').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('idPromover').value;
    const payload = {
        usuario_id: id,
        novo_cargo: document.getElementById('novoCargo').value,
        motivo: document.getElementById('motivoPromocao').value
    };

    const res = await fetch('/carreira/promover', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Promoção registrada!');
        fecharModal('modalPromover');
        carregarFuncionarios();
    } else {
        alert('Erro ao promover');
    }
});

// === 4. DEMITIR ===
function abrirModalDemitir(id, nome) {
    document.getElementById('idDemitir').value = id;
    document.getElementById('nomeDemitir').textContent = nome;
    abrirModal('modalDemitir');
}

document.getElementById('formDemitir').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('idDemitir').value;
    const payload = {
        usuario_id: id,
        motivo: document.getElementById('motivoDemissao').value
    };

    const res = await fetch('/carreira/demitir', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Funcionário desligado.');
        fecharModal('modalDemitir');
        carregarFuncionarios();
    } else {
        alert('Erro ao demitir');
    }
});

// === UTILITÁRIOS DE MODAL ===
function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
}
function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}
// Logout (reaproveitado)
function logout() { localStorage.clear(); window.location.href = '/'; }

// Iniciar
carregarFuncionarios();