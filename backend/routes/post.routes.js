import express from 'express';
import upload from '../middlewares/multer.js';
import { addComment, addNewPost, bookmarkPost, deletePost, getAllCommentsOnPost, getAllPost, getUsersAllPost, manageDislikePost, manageLikePost } from '../controllers/post.controller.js';
import { isUserAuthenticated } from '../middlewares/isAuthenticated.js';

const postRouter = express.Router();

postRouter.post('/addPost', isUserAuthenticated, upload.single('image'), addNewPost);
postRouter.get('/allPost', isUserAuthenticated, upload.single('image'), getAllPost);
postRouter.get('/userPost/allPost', isUserAuthenticated, upload.single('image'), getUsersAllPost);
postRouter.get('/:id/like', isUserAuthenticated, upload.single('image'), manageLikePost);
postRouter.get('/:id/dislike', isUserAuthenticated, upload.single('image'), manageDislikePost);
postRouter.post('/:id/comment', isUserAuthenticated, upload.single('image'), addComment);
postRouter.post('/:id/comment/all', isUserAuthenticated, upload.single('image'), getAllCommentsOnPost);
postRouter.post('/delete/:id', isUserAuthenticated, upload.single('image'), deletePost);
postRouter.post('/:id/bookmark', isUserAuthenticated, upload.single('image'), bookmarkPost);

export default postRouter;