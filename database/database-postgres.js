import { randomUUID } from 'node:crypto';
import { sql } from './db.js';

export class DatabasePostgres {
    async createUser(user) {
        const { email, password } = user;

        const [createdUser] = await sql`
            insert into users (email, password)
            values (${email}, ${password})
            returning id, email
        `;
        return createdUser;
    }

    async createSurvey(survey) {
        const { title, description, user_id } = survey;

        const [createdSurvey] = await sql`
            insert into surveys (title, description, user_id)
            values (${title}, ${description}, ${user_id})
            returning id, title, description, user_id
        `;
        return createdSurvey;
    }

    async createOption(option) {
        const { title, survey_id } = option;

        await sql`
            insert into options (title, survey_id)
            values (${title}, ${survey_id})
        `;
    }

    async createVotedOption(optionVoted) {
        const { survey_id, option_id, user_id } = optionVoted;

        const [createdOptionVoted] = await sql`
            insert into optionVoted (survey_id, option_id, user_id)
            values (${survey_id}, ${option_id}, ${user_id})
            returning id, survey_id, option_id, user_id
        `;

        return createdOptionVoted;
    }

    async listSurveys(search = '') {
        let surveys;

        if (search) {
            surveys = await sql`
                select * from surveys
                where title like ${'%'+search+'%'}
            `;
        } else {
            surveys = await sql`select * from surveys`;
        }

        return surveys;
    }

    async listSurveysByUserId(search = '', user_id = 0) {
        let surveys;

        if (!user_id) {
            return null;
        }

        if (search) {
            surveys = await sql`
                select * from surveys
                where title like ${'%'+search+'%'}
                and user_id = ${user_id}
            `;
        } else {
            surveys = await sql`
                select * from surveys
                where user_id = ${user_id}
            `;
        }

        return surveys;
    }

    async listSurveysVotedByUserId(search = '', user_id = 0) {
        let surveys;

        if (!user_id) {
            return null;
        }

        if (search) {
            surveys = await sql`
                SELECT 
                    s.id,
                    s.title,
                    s.description,
                    s.created_at,
                    s.user_id
                FROM 
                    surveys s
                JOIN 
                    optionVoted ov ON s.id = ov.survey_id
                WHERE 
                    s.title like ${'%'+search+'%'} and
                    ov.user_id = ${user_id}
            `;
        } else {
            surveys = await sql`
                SELECT 
                    s.id,
                    s.title,
                    s.description,
                    s.created_at,
                    s.user_id
                FROM 
                    surveys s
                JOIN 
                    optionVoted ov ON s.id = ov.survey_id
                WHERE 
                    ov.user_id = ${user_id}
            `;
        }

        return surveys;
    }

    async userByEmail(email) {
        const [user] = await sql`
            select id, email from users
            where email = ${email}
        `;

        return user;
    }

    async loginUser(email) {
        const [user] = await sql`
            select * from users
            where email = ${email}
        `;

        return user;
    }

    async surveyBySurveyIdAndUserId(survey_id, user_id = 0) {
        const [survey] = await sql`
            SELECT 
                s.id,
                s.title,
                s.description,
                ov.option_id AS user_voted_option_id
            FROM 
                surveys s
            LEFT JOIN 
                optionVoted ov ON s.id = ov.survey_id AND ov.user_id = ${user_id}
            WHERE 
                s.id = ${survey_id}
        `;

        return survey;
    }

    async surveyOptionsBySurveyId(survey_id) {
        const options = await sql`
            SELECT 
                o.id,
                o.title,
                COUNT(ov.option_id) AS votes_count
            FROM 
                options o
            LEFT JOIN 
                optionVoted ov ON o.id = ov.option_id
            WHERE 
                o.survey_id = ${survey_id}
            GROUP BY 
                o.id, o.title
        `;

        return options;
    }

    async optionVotedBySurveyIdAndUserId(survey_id, user_id) {
        const [optionVoted] = await sql`
            select * from optionVoted
            where survey_id = ${survey_id} and user_id = ${user_id}
        `;

        return optionVoted;
    }
}