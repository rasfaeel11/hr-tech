import { Request, Response } from 'express';
import pool from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;

        // 1. Buscar o usuário pelo Email
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);
        const user = result.rows[0];

        // Se não achou o email
        if (!user) {
            return res.status(400).json({ error: 'Email ou senha inválidos' });
        }

        // 2. Verificar a Senha 
        const validPassword = await bcrypt.compare(senha, user.senha_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email ou senha inválidos' });
        }

        // 3. Gerar o Token JWT
        // Se o JWT_SECRET não existir,  um padrão para o codigo não da pau 
        const secret = process.env.JWT_SECRET || 'secret_padrao_dev';
        
        const token = jwt.sign(
            { 
                id: user.id, 
                perfil: user.perfil, 
                nome: user.nome_completo 
            }, 
            secret, 
            { expiresIn: '8h' } // O token expira em 8 horas
        );

        // 4. Retornar o token e dados básicos 
        return res.json({
            message: 'Login realizado com sucesso!',
            token: token,
            user: {
                id: user.id,
                nome: user.nome_completo,
                perfil: user.perfil,
                cargo: user.cargo
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro no servidor ao fazer login' });
    }
};