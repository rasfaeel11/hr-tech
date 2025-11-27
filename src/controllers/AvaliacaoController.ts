import { Request, Response } from 'express';
import pool from '../db';

export const criarAvaliacao = async (req: Request, res: Response) => {
    const client = await pool.connect();

    try {
        const { avaliado_id, tipo, periodo, itens } = req.body;
        const avaliador_id = (req as any).usuarioId; 

        // --- CORREÇÃO: CALCULAR A MÉDIA ---
        // Se não tiver itens, a nota é 0. Se tiver, soma tudo e divide pela quantidade.
        let mediaCalculada = 0;
        if (itens && itens.length > 0) {
            const soma = itens.reduce((acc: number, item: any) => acc + Number(item.nota), 0);
            mediaCalculada = soma / itens.length;
        }
        // ----------------------------------

        await client.query('BEGIN');

        // Agora inserimos a 'mediaCalculada' no campo 'nota_final'
        const avaliacaoQuery = `
            INSERT INTO avaliacoes (avaliado_id, avaliador_id, tipo, periodo, nota_final, data_avaliacao)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id;
        `;
        
        // Adicionamos mediaCalculada no array de valores ($5)
        const avaliacaoResult = await client.query(avaliacaoQuery, [
            avaliado_id, 
            avaliador_id, 
            tipo, 
            periodo, 
            mediaCalculada
        ]);
        
        const novaAvaliacaoId = avaliacaoResult.rows[0].id;

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

        await client.query('COMMIT');

        return res.status(201).json({ 
            message: 'Avaliação registrada com sucesso!',
            avaliacao_id: novaAvaliacaoId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: 'Erro ao registrar avaliação.' });
    } finally {
        client.release();
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