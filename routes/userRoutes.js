import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { verifyJWT } from '../middlewares/authenticate-jwt.js';

const userRoutes = Router();
const userController = new UserController();

userRoutes.post('/users', userController.create);
userRoutes.post('/login', userController.login);
userRoutes.post('/token-login', verifyJWT, userController.tokenLogin);
userRoutes.post('/logout', verifyJWT, userController.logout);

export default userRoutes;