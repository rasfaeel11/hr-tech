import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log("--- DEBUG DO BANCO ---");
// Verificação simples se a variável existe
if (!process.env.DATABASE_URL) {
    console.error("❌ ERRO: DATABASE_URL faltando no .env");
    process.exit(1);
}
console.log("✅ Variável encontrada. Tentando conectar...");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Adicione isso para funcionar no Supabase/Nuvem:
    ssl: {
        rejectUnauthorized: false 
    }
});

pool.on('connect', () => {
    console.log('✅ SUCESSO: Conexão com o PostgreSQL ativa!');
});

// Tratamento de erro global do pool para não derrubar o servidor
pool.on('error', (err) => {
    console.error('❌ Erro inesperado no cliente do banco', err);
    process.exit(-1);
});

export default pool;