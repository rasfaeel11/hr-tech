import { Request, Response } from 'express';
import pool from '../db';

export const criarAvaliacao = async (req: Request, res: Response) => {
    // Pegamos um "cliente" do pool para poder controlar a transação manualmente
    const client = await pool.connect();

    try {
        const { avaliado_id, tipo, periodo, itens } = req.body;
        // O "avaliador_id" vem do Token (quem está logado), lembra do middleware?
        const avaliador_id = (req as any).usuarioId; 

        // 1. INICIAR TRANSAÇÃO (Começa o modo de segurança)
        await client.query('BEGIN');

        // 2. Criar a "Capa" da avaliação na tabela principal
        const avaliacaoQuery = `
            INSERT INTO avaliacoes (avaliado_id, avaliador_id, tipo, periodo, data_avaliacao)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id;
        `;
        const avaliacaoResult = await client.query(avaliacaoQuery, [avaliado_id, avaliador_id, tipo, periodo]);
        const novaAvaliacaoId = avaliacaoResult.rows[0].id;

        // 3. Salvar cada item (nota) da lista
        // "itens" é um array que vem do Front-end
        const itemQuery = `
            INSERT INTO itens_avaliacao (avaliacao_id, competencia, nota, comentario)
            VALUES ($1, $2, $3, $4)
        `;

        for (const item of itens) {
            await client.query(itemQuery, [
                novaAvaliacaoId, 
                item.competencia, 
                item.nota, 
                item.comentario
            ]);
        }

        // 4. FINALIZAR TRANSAÇÃO (Salva tudo de verdade)
        await client.query('COMMIT');

        return res.status(201).json({ 
            message: 'Avaliação registrada com sucesso!',
            avaliacao_id: novaAvaliacaoId
        });

    } catch (error) {
        // Se der qualquer erro, DESFAZ TUDO (Rollback)
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: 'Erro ao registrar avaliação.' });
    } finally {
        client.release(); // Solta a conexão
    }
};

// Função simples para listar avaliações de um usuário
export const listarAvaliacoes = async (req: Request, res: Response) => {
    try {
        const { usuario_id } = req.params;
        const result = await pool.query(`
            SELECT a.*, u.nome_completo as nome_avaliador 
            FROM avaliacoes a
            JOIN usuarios u ON a.avaliador_id = u.id
            WHERE a.avaliado_id = $1
        `, [usuario_id]);
        
        return res.json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar avaliações' });
    }
};