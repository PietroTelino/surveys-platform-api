import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';

const allowedOrigins = [
    'http://localhost',
    'https://pietrotelino.github.io/surveys-platform-front/'
];
const app = express();
const msg = 'The CORS policy for this site does not allow access from the specified Origin.';

// app.use(
//     cors({
//         origin: function (origin, callback) {
//             if (!origin) return callback(null, true);

//             if (allowedOrigins.indexOf(origin) === -1) {
//                 return callback(new Error(msg), false);
//             }

//             return callback(null, true);
//         }
//     })
// );
app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(surveyRoutes);

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ?? 3333,
}, () => {
    console.log('Servidor Online');
});