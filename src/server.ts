import express from 'express';
import pool from './db';
import path from 'path'; // <--- 1. Importante para achar a pasta

// Importação das rotas
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import avaliacaoRoutes from './routes/avaliacaoRoutes';
import medidaRoutes from './routes/medidaRoutes';
import historicoRoutes from './routes/historicoRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

app.use(express.json());

// --- 2. COMANDO MÁGICO QUE FALTAVA ---
// Isso diz: "Express, entregue os arquivos da pasta 'public' para quem acessar o site"
const caminhoPublic = path.join(__dirname, '../public');
console.log("📂 O servidor está buscando o site nesta pasta:", caminhoPublic)
app.use(express.static(caminhoPublic));
// -------------------------------------

// Log de Debug (Espião)
app.use((req, res, next) => {
    console.log(`Recebi uma requisição: ${req.method} ${req.url}`);
    next();
}); 

// Rotas da API
app.use('/auth', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/avaliacoes', avaliacaoRoutes);
app.use('/carreira', historicoRoutes);
app.use('/medidas', medidaRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 3000;

console.log("--- 1. Script Iniciado ---");

app.listen(PORT, async () => {
    console.log(`--- 2. Servidor HTTP rodando na porta ${PORT} ---`);
    console.log(`--- 3. ACESSE O SITE EM: http://localhost:${PORT} ---`); // <--- Link clicável

    try {
        const client = await pool.connect();
        console.log("✅ SUCESSO TOTAL: Banco de Dados Conectado!");
        client.release();
    } catch (error) {
        console.error("❌ ERRO GRAVE: Não foi possível conectar no Banco.");
        console.error("Motivo do erro:", error);
    }
});