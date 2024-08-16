import { sql } from './db.js';

sql`
    DROP TABLE IF EXISTS users
`.then(() => {
    console.log('tabela usuários excluida');
});

sql`
    DROP TABLE IF EXISTS surveys
`.then(() => {
    console.log('tabela enquetes excluida');
});

sql`
    DROP TABLE IF EXISTS options
`.then(() => {
    console.log('tabela de opções excluida');
});

sql`
    DROP TABLE IF EXISTS optionVoted
`.then(() => {
    console.log('tabela de votos excluida');
});