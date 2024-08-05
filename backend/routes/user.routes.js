import express from 'express';
import {
    userRegister, userLogin, userLogout, getUserProfile,
    editUserProfile, getSuggestedUsers, manageFollowers
} from '../controllers/user.controller.js';
import { isUserAuthenticated } from '../middlewares/isAuthenticated.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', userRegister);
userRouter.post('/login', userLogin);
userRouter.get('/logout', userLogout);
userRouter.get('/:id/profile', isUserAuthenticated, getUserProfile);
userRouter.post('/profile/edit', isUserAuthenticated, upload.single('profilePic'), editUserProfile);
userRouter.get('/suggested', isUserAuthenticated, getSuggestedUsers);
userRouter.post('/followers/:id', isUserAuthenticated, manageFollowers);

export default userRouter;