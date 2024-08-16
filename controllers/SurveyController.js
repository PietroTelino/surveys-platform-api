import { DatabasePostgres } from '../database/database-postgres.js';
import { HttpError } from '../errors/HttpError.js';

export class SurveyController {
    // Constutor de SurveyController
    constructor() {
        this.database = new DatabasePostgres();
        this.create = this.create.bind(this);
        this.list = this.list.bind(this);
        this.getSurveysByUserId = this.getSurveysByUserId.bind(this);
        this.statics = this.statics.bind(this);
        this.vote = this.vote.bind(this);
        this.getSurveysVotedByUserId = this.getSurveysVotedByUserId.bind(this);
    }

    // Insere uma enquete na base de dados
    async create(request, reply) {
        try {
            const { title, description, options } = request.body;
            const user_id = request.loggedUser.id;

            if (title.length < 1) {
                throw new HttpError(
                    'O título não pode ser vazio.',
                    400
                );
            }

            if (description.length < 1) {
                throw new HttpError(
                    'A descrição não pode ser vazia.',
                    400
                );
            }

            if (options.length < 2) {
                throw new HttpError(
                    'A enquete deve ter pelo menos duas opções.',
                    400
                );
            }
            
            // Insere uma enquete no banco de dados, retornando o id dela
            const createdSurvey = await this.database.createSurvey({
                title: title,
                description: description,
                user_id: user_id,
            });

            if (!createdSurvey) {
                throw new HttpError(
                    'Não foi possível criar a enquete.',
                    400
                );
            }

            // Caso a enquete tenha sido inserida, insere as opções da enquete
            options.forEach(async (option) => {
                await this.database.createOption({
                    title: option.title,
                    survey_id: createdSurvey.id,
                });
            });
        
            return reply.status(201).send({
                survey: createdSurvey,
                message: 'Enquete criada com sucesso.'
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Lista todas as enquetes da plataforma
    async list(request, reply) {
        try {
            const search = request.query.search ?? '';
            const surveys = await this.database.listSurveys(search);

            if (!surveys) {
                throw new HttpError(
                    'Não foi possível encontrar as enquetes.',
                    400
                );
            }

            return reply.status(200).send({
                surveys: surveys,
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Lista todas as enquetes de um usuário
    async getSurveysByUserId(request, reply) {
        try {
            const search = request.query.search ?? '';
            const user_id = request.loggedUser.id;
            const surveys = await this.database.listSurveysByUserId(search, user_id);

            if (!surveys) {
                throw new HttpError(
                    'Não foi possível encontrar as enquetes do usuário.',
                    400
                );
            }

            return reply.status(200).send({
                surveys: surveys,
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Lista todas as enquetes que o usuário já votou
    async getSurveysVotedByUserId(request, reply) {
        try {
            const search = request.query.search ?? '';
            const user_id = request.loggedUser.id;
            const surveys = await this.database.listSurveysVotedByUserId(search, user_id);

            if (!surveys) {
                throw new HttpError(
                    'Não foi possível encontrar as enquetes do usuário.',
                    400
                );
            }

            return reply.status(200).send({
                surveys: surveys,
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Exibe todos os dados de uma enquete
    async statics(request, reply) {
        try {
            const { survey_id } = request.params;
            const user_id = request.loggedUser ? request.loggedUser.id : 0;
            
            // Recupera as informações da enquete juntamente com o voto do uusário logado
            const survey = await this.database.surveyBySurveyIdAndUserId(survey_id, user_id);

            if (!survey) {
                throw new HttpError(
                    'Não foi possível encontrar a enquete.',
                    400
                );
            }

            // Recupera uma lista de opções da enquete juntamente com a quatidade de votos
            const options = await this.database.surveyOptionsBySurveyId(survey_id);

            if (!options) {
                throw new HttpError(
                    'Não foi possível encontrar as opções da enquete.',
                    400
                );
            }

            return reply.status(200).send({
                survey: survey ?? null,    
                options: options ?? null,        
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }

    // Votar em uma opção da enquete
    async vote(request, reply) {
        try {
            const { survey_id, option_id } = request.params;
            const user_id = request.loggedUser ? request.loggedUser.id : 0;

            // Busca um voto do usuário na enquete
            const alreadyVotedOption = await this.database.optionVotedBySurveyIdAndUserId(survey_id, user_id);

            // Caso o usuário já tenha votado na enquete, não deixa ele votar novamente
            if (alreadyVotedOption) {
                throw new HttpError(
                    'Você já votou nesta enquete.',
                    409
                );
            }
            
            // Registra o voto do usuário no banco de dados
            const votedOption = await this.database.createVotedOption({
                survey_id: survey_id,
                option_id: option_id,
                user_id: user_id,
            });

            if (!votedOption) {
                throw new HttpError(
                    'Não foi possível votar na enquete.',
                    400
                );
            }

            return reply.status(200).send({
                votedOption: votedOption,
                message: 'O seu voto foi computado com sucesso.',
            });
        } catch (error) {
            return reply.status(error.statusCode || 500).json({
                message: error.message || 'Erro interno do servidor.'
            });
        }
    }
}