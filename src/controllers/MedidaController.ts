import { Request, Response } from 'express';
import pool from '../db';

export const aplicarMedida = async (req: Request, res: Response) => {
    try {
        const { usuario_id, tipo, descricao_motivo } = req.body;
        

        const aplicador_id = (req as any).usuarioId;
        const aplicador_perfil = (req as any).usuarioPerfil;


        if (aplicador_perfil !== 'ADMIN' && aplicador_perfil !== 'GESTOR_RH') {
            return res.status(403).json({ 
                error: 'Acesso negado. Apenas ADMIN ou RH podem aplicar medidas disciplinares.' 
            });
        }


        // Verifica se o usuário alvo existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuario_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Funcionário não encontrado.' });
        }

        const query = `
            INSERT INTO medidas_disciplinares (usuario_id, aplicador_id, tipo, descricao_motivo)
            VALUES ($1, $2, $3, $4)
            RETURNING id, tipo, data_aplicacao;
        `;

        const result = await pool.query(query, [usuario_id, aplicador_id, tipo, descricao_motivo]);

        return res.status(201).json({
            message: 'Medida disciplinar aplicada com sucesso.',
            detalhes: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao aplicar medida disciplinar.' });
    }
};

export const listarMedidasPorUsuario = async (req: Request, res: Response) => {
    try {
        const { usuario_id } = req.params;

        const query = `
            SELECT m.*, u.nome_completo as nome_aplicador 
            FROM medidas_disciplinares m
            JOIN usuarios u ON m.aplicador_id = u.id
            WHERE m.usuario_id = $1
            ORDER BY m.data_aplicacao DESC
        `;

        const result = await pool.query(query, [usuario_id]);
        return res.json(result.rows);

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar histórico disciplinar.' });
    }
};