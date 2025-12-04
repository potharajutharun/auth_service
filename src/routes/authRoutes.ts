import express from 'express';
import { loginController } from '../controllers/loginController.js';

const router = express.Router();

//  console.log('Setting up /login route');

router.post('/login', loginController);

export default router;
