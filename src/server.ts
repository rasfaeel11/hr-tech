import express from 'express';
import pool from './db';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("--- 1. Script Iniciado ---");

app.listen(PORT, async () => {
    console.log(`--- 2. Servidor HTTP rodando na porta ${PORT} ---`);
    console.log("--- 3. Tentando conectar ao Supabase... (Aguarde) ---");

    try {
        // Tenta forçar uma conexão agora mesmo
        const client = await pool.connect();
        console.log("✅ SUCESSO TOTAL: Banco de Dados Conectado!");
        client.release(); // Solta a conexão
    } catch (error) {
        console.error("❌ ERRO GRAVE: Não foi possível conectar no Banco.");
        console.error("Motivo do erro:", error);
    }
});