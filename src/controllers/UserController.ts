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
        const result = await pool.query('SELECT id, nome_completo, email, cargo, perfil FROM usuarios');
        return res.json(result.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};