import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response) => {
    try {
        // 1. Pegar os dados que vêm do corpo da requisição 
        const { nome_completo, email, senha, cargo, perfil, data_admissao } = req.body;

        // 2. Verificar se o usuário já existe
        const userCheck = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado.' });
        }

        // 3. Criptografar a senha 
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        // 4. Inserir no Banco de Dados
        const query = `
            INSERT INTO usuarios (nome_completo, email, senha_hash, cargo, perfil, data_admissao)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome_completo, email, perfil;
        `;
        
        const values = [nome_completo, email, senha_hash, cargo, perfil, data_admissao];
        const result = await pool.query(query, values);

        // 5. Responder com sucesso
        return res.status(201).json({
            message: 'Usuário criado com sucesso!',
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    
};

export const listUsers = async (req: Request, res: Response) => {
    try {
        // Busca ID e Nome de todo mundo (evite trazer a senha!)
        const result = await pool.query('SELECT id, nome_completo, email, cargo, perfil, ativo FROM usuarios');
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT id, nome_completo, email, cargo, perfil, data_admissao FROM usuarios WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nome_completo, cargo, email } = req.body; // Vamos permitir editar isso

        // Verifica se o usuário existe antes de tentar editar
        const checkUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const query = `
            UPDATE usuarios 
            SET nome_completo = $1, cargo = $2, email = $3
            WHERE id = $4
            RETURNING id, nome_completo, cargo, email;
        `;

        const result = await pool.query(query, [nome_completo, cargo, email, id]);

        return res.json({
            message: 'Dados atualizados com sucesso!',
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.json({ message: 'Usuário deletado com sucesso!' });

    } catch (error) {
        console.error(error);
        // Tratamento simples para o erro de chave estrangeira
        if ((error as any).code === '23503') {
            return res.status(400).json({ error: 'Não é possível deletar este usuário pois ele possui registros vinculados (avaliações, etc).' });
        }
        return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
};