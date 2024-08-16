import { Router } from 'express';
import { SurveyController } from '../controllers/SurveyController.js';
import { verifyJWT } from '../middlewares/authenticate-jwt.js';

const surveyRoutes = Router();
const surveyController = new SurveyController();

surveyRoutes.get('/surveys', surveyController.list);
surveyRoutes.get('/survey/:survey_id', verifyJWT, surveyController.statics);
surveyRoutes.post('/survey', verifyJWT, surveyController.create);
surveyRoutes.get('/my-surveys', verifyJWT, surveyController.getSurveysByUserId);
surveyRoutes.get('/my-votes', verifyJWT, surveyController.getSurveysVotedByUserId);
surveyRoutes.post('/vote/survey/:survey_id/option/:option_id', verifyJWT, surveyController.vote);

export default surveyRoutes;