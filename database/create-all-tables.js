import { sql } from './db.js';

sql`
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    );
`.then(() => {
    console.log('tabela de usuários criada');
    return sql`
        CREATE TABLE surveys (
            id          SERIAL PRIMARY KEY,
            title       VARCHAR(255) NOT NULL,
            description TEXT,
            created_at  DATE DEFAULT CURRENT_DATE NOT NULL,
            user_id     INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;
}).then(() => {
    console.log('tabela de enquetes criada');
    return sql`
        CREATE TABLE options (
            id        SERIAL PRIMARY KEY,
            title     VARCHAR(255) NOT NULL,
            survey_id INTEGER NOT NULL,
            FOREIGN KEY (survey_id) REFERENCES surveys(id)
        );
    `;
}).then(() => {
    console.log('tabela de opções criada');
    return sql`
        CREATE TABLE optionVoted (
            id        SERIAL PRIMARY KEY,
            survey_id INTEGER NOT NULL,
            option_id INTEGER NOT NULL,
            user_id   INTEGER NOT NULL,
            FOREIGN KEY (survey_id) REFERENCES surveys(id),
            FOREIGN KEY (option_id) REFERENCES options(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;
}).then(() => {
    console.log('tabela de votos criada');
    process.exit(0);
}).catch((error) => {
    console.error('Erro ao criar as tabelas:', error);
    process.exit(1);
});