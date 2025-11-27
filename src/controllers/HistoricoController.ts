import { Request, Response } from 'express';
import pool from '../db';

// US005 - Gerar Promoção
export const promoverUsuario = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { usuario_id, novo_cargo, motivo } = req.body;
        
        await client.query('BEGIN');


        const userRes = await client.query('SELECT cargo FROM usuarios WHERE id = $1', [usuario_id]);
        if (userRes.rows.length === 0) {
            throw new Error('Usuário não encontrado');
        }
        const cargo_anterior = userRes.rows[0].cargo;


        await client.query(
            'UPDATE usuarios SET cargo = $1 WHERE id = $2',
            [novo_cargo, usuario_id]
        );


        await client.query(`
            INSERT INTO historico_carreira (usuario_id, tipo_evento, cargo_anterior, cargo_novo, observacao, data_evento)
            VALUES ($1, 'PROMOCAO', $2, $3, $4, NOW())
        `, [usuario_id, cargo_anterior, novo_cargo, motivo]);

        await client.query('COMMIT');
        
        return res.json({ message: `Sucesso! Usuário promovido para ${novo_cargo}.` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: 'Erro ao processar promoção.' });
    } finally {
        client.release();
    }
};


export const demitirUsuario = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        const { usuario_id, motivo } = req.body;
        
        await client.query('BEGIN');


        const userRes = await client.query('SELECT cargo FROM usuarios WHERE id = $1', [usuario_id]);
        const cargo_atual = userRes.rows[0].cargo;

        // nao resolvi usar soft delete, pra faculdade nao e preciso eu acredito
        await client.query(
            'DELETE FROM usuarios WHERE id = $1',
            [usuario_id]
        );

        await client.query(`
            INSERT INTO historico_carreira (usuario_id, tipo_evento, cargo_anterior, cargo_novo, observacao, data_evento)
            VALUES ($1, 'DEMISSAO', $2, 'DESLIGADO', $3, NOW())
        `, [usuario_id, cargo_atual, motivo]);

        await client.query('COMMIT');
        
        return res.json({ message: 'Demissão registrada. O acesso do usuário foi revogado.' });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return res.status(500).json({ error: 'Erro ao processar demissão.' });
    } finally {
        client.release();
    }
};

export const listarHistorico = async (req: Request, res: Response) => {
    const { usuario_id } = req.params;
    const result = await pool.query(
        'SELECT * FROM historico_carreira WHERE usuario_id = $1 ORDER BY data_evento DESC', 
        [usuario_id]
    );
    res.json(result.rows);
};