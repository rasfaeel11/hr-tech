import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para enganar o TS e deixar adicionar o campo 'user' na requisição
interface TokenPayload {
    id: number;
    perfil: string;
    iat: number;
    exp: number;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    // 1. Verifica se mandaram o token
    if (!authorization) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    // O token vem assim: "Bearer eyJhbGci..."
    // Precisamos tirar a palavra "Bearer" e pegar só o código
    const token = authorization.split(' ')[1];

    try {
        // 2. Verifica a validade do token
        const secret = process.env.JWT_SECRET || 'secret_padrao_dev';
        const decoded = jwt.verify(token, secret);

        // 3. Salva os dados do usuário na requisição para usar depois
        // O "user" não existe nativamente no req, então usamos "as any" ou estendemos a interface.
        // vamos injetar direto.
        (req as any).usuarioId = (decoded as TokenPayload).id;
        (req as any).usuarioPerfil = (decoded as TokenPayload).perfil;

        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
};