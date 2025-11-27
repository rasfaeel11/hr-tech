// 1. Verificar se está logado (Segurança no Front)
const token = localStorage.getItem('token');
if (!token) {
    alert('Você precisa estar logado!');
    window.location.href = '/';
}

// Preencher nome do usuário na barra
const user = JSON.parse(localStorage.getItem('user'));
document.getElementById('userName').textContent = `Olá, ${user.nome}`;

// Função de Logout
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// 2. Carregar Dados do Dashboard
async function carregarDashboard() {
    try {
        const response = await fetch('/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            logout(); // Token expirou
            return;
        }

        const data = await response.json();

        // A. Preencher Cards
        document.getElementById('totalFunc').textContent = data.cards.total_funcionarios;
        document.getElementById('totalAtivos').textContent = data.cards.ativos;
        document.getElementById('totalDesligados').textContent = data.cards.desligados;
        document.getElementById('turnover').textContent = data.cards.demissoes_mes;

        // B. Renderizar Gráfico
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = ''; // Limpa o "Carregando..."

        data.grafico_cargos.forEach(item => {
            const porcentagem = (item.media_nota / 10) * 100; // Nota 0 a 10 vira 0 a 100%
            
            const htmlBarra = `
                <div class="bar-wrapper">
                    <div class="bar-label">${item.cargo}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${porcentagem}%">
                            ${item.media_nota}
                        </div>
                    </div>
                </div>
            `;
            chartContainer.innerHTML += htmlBarra;
        });

        // C. Renderizar Ranking
        const rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = '';

        data.ranking.forEach(talento => {
            const htmlItem = `
                <li class="ranking-item">
                    <span>${talento.nome_completo} <small>(${talento.cargo})</small></span>
                    <span class="ranking-nota">★ ${talento.nota_final}</span>
                </li>
            `;
            rankingList.innerHTML += htmlItem;
        });

    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dados. Veja o console.');
    }
}

// Inicia tudo ao carregar a página
carregarDashboard();