import jwt from 'jsonwebtoken';

export async function verifyJWT(request, reply, next) {
    const secretKey = process.env.SECRET_KEY;
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
        return reply.status(403).send({
            auth: false,
            message: 'Token não encontrado.'
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return reply.status(403).send({
            auth: false,
            message: 'O formato do token está errado.'
        });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return reply.status(500).send({
                auth: false,
                message: 'O usuário precisa estar logado para utilizar esta funcionalidade.'
            });
        }

        // Se tudo estiver certo, salva no request e prossegue
        request.loggedUser = {
            id: decoded.id,
            email: decoded.email,
        };
        next();
    });
}