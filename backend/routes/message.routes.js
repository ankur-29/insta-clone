import express from 'express';
import { isUserAuthenticated } from '../middlewares/isAuthenticated.js';
import { getMessage, sendMessage } from '../controllers/message.controller.js';

const messageRouter = express.Router();

messageRouter.get('/send/:id', isUserAuthenticated, sendMessage);
messageRouter.post('/all/:id', isUserAuthenticated, getMessage);

export default messageRouter;