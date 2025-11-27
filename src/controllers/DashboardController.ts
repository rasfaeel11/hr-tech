import { Request, Response } from 'express';
import pool from '../db';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // 1. CARDS DO TOPO 
  
        const queryGeral = `
            SELECT 
                COUNT(*) as total_colaboradores,
                SUM(CASE WHEN ativo = true THEN 1 ELSE 0 END) as ativos,
                SUM(CASE WHEN ativo = false THEN 1 ELSE 0 END) as desligados
            FROM usuarios
            WHERE perfil != 'ADMIN'; -- Ignora o admin nos cálculos
        `;
        const resGeral = await pool.query(queryGeral);

        //  MÉDIA DE DESEMPENHO POR CARGO 

        const queryDesempenho = `
            SELECT u.cargo, ROUND(AVG(a.nota_final), 1) as media_nota
            FROM avaliacoes a
            JOIN usuarios u ON a.avaliado_id = u.id
            GROUP BY u.cargo
            ORDER BY media_nota DESC;
        `;
        const resDesempenho = await pool.query(queryDesempenho);

        //  TOP 5 TALENTOS
        const queryTopTalentos = `
            SELECT u.nome_completo, u.cargo, a.nota_final, a.periodo
            FROM avaliacoes a
            JOIN usuarios u ON a.avaliado_id = u.id
            ORDER BY a.nota_final DESC
            LIMIT 5;
        `;
        const resTopTalentos = await pool.query(queryTopTalentos);

        // TURN OVER RECENTE 
        const queryTurnover = `
            SELECT COUNT(*) as demissoes_recentes
            FROM historico_carreira
            WHERE tipo_evento = 'DEMISSAO'
            AND data_evento > (NOW() - INTERVAL '30 days');
        `;
        const resTurnover = await pool.query(queryTurnover);

        return res.json({
            cards: {
                total_funcionarios: resGeral.rows[0].total_colaboradores,
                ativos: resGeral.rows[0].ativos,
                desligados: resGeral.rows[0].desligados,
                demissoes_mes: resTurnover.rows[0].demissoes_recentes
            },
            grafico_cargos: resDesempenho.rows, 
            ranking: resTopTalentos.rows         
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao carregar dashboard.' });
    }
};