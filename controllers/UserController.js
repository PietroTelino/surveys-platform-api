import { DatabasePostgres } from '../database/database-postgres.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { HttpError } from '../errors/HttpError.js';

export class UserController {
    // Construtor de UserController
    constructor() {
        // Métodos públicos e variáveis locais devem ser vinculadas
        // Métodos privados (#) não precisam ser vinculados
        this.secretKey = process.env.SECRET_KEY;
        this.database = new DatabasePostgres();
        this.create = this.create.bind(this);
        this.login = this.login.bind(this);
        this.tokenLogin = this.tokenLogin.bind(this);
        this.logout = this.logout.bind(this);
    }

    // Insere um usuário no banco de dados
    async create(request, reply) {
        try {
            const { email, password } = request.body;
            const hashedPassword = await bcrypt.hash(password, 8);

            if (email.length == 0) {
                throw new HttpError(
                    'Preencha o campo de e-mail corretamente.',
                    400
                );
            }

            if (!this.#isValidEmail(email)) {
                throw new HttpError(
                    'Formato de e-mail inválido.',
                    400
                );
            }

            if (password.length < 6) {
                throw new HttpError(
                    'A senha deve ter pelo menos 6 caracteres.',
                    400
                );
            }
            
            // Busca um usuário com o email passado
            const alreadyExistentUser = await this.database.userByEmail(email);

            // Caso já exista um usuário com o mesmo email, retorna um erro
            if (alreadyExistentUser) {
                throw new HttpError(
                    'Já existe um usuário com este e-mail.',
                    409
                );
            }
            
            // Insere um usuáiro no banco de dados e retorna seu id
            const createdUser = await this.database.createUser({
                email: email,
                password: hashedPassword,
            });

            // Cria um token JWT que deverá ser utilizado em outras requisições
            const token = this.#generateJWT({
                id: createdUser.id,
                email: email,
            });
        
            return reply.status(201).send({
                user: createdUser,
                token: token,
                message: 'Usuário criado e logado com sucesso.'
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Faz o login do usuário com o token JWT
    async tokenLogin(request, reply) {
        try {
            // Recupera o id e o email do token
            const { id, email } = request.loggedUser;

            // Cria um token JWT renovado
            const token = this.#generateJWT({
                id: id,
                email: email,
            });

            return reply.status(200).send({
                user: {
                    id: id,
                    email: email
                },
                token: token
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }
    
    // Logindo usuário
    async login(request, reply) {
        try {
            const { email, password } = request.body;
            const user = await this.database.loginUser(email);
        
            // Verifica se o usuário foi encontrado e se a senha confere
            if (!user || !bcrypt.compareSync(password, user.password)) {
                throw new HttpError(
                    'Usuário e/ou senha incorreto(s)!',
                    401
                );
            }
        
            // Cria um token JWT que deverá ser utilizado em outras requisições
            const token = this.#generateJWT({
                id: user.id,
                email: user.email,
            });
        
            // Retorna o usuário logado juntamente com o JWT
            return reply.status(200).send({
                user: {
                    id: user.id,
                    email: user.email,
                },
                token: token,
                message: 'Login realizado com sucesso.',
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }        
    }

    // Encerra a sessão do usuário
    async logout(request, reply) {
        try {
            return reply.status(204).send();
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }
    
    // Cria um token de autenticação
    #generateJWT(user) {
        const { id, email } = user;

        const token = jwt.sign({
            id: id,
            email: email,
        }, this.secretKey, {
            expiresIn: '24h',
        });

        return token;
    }

    // Verifica se o formato do email é válido ou não
    #isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}