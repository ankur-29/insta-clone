import sharp from "sharp";
import Post from "../models/post.models.js";
import cloudinary from "../utils/cloudinary.js";
import User from "../models/user.models.js";
import Comment from "../models/comment.models.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const autherId = req.id;
        if (!image) {
            return res.status(400).json({ message: `Image required.` });
        }
        const optimizedImage = await sharp(image.buffer)
            .resize({ height: 800, width: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
        const fileUri = `data:image/jpeg;base:64,${optimizedImage.toString('base64')}`;
        const cloudinaryRes = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudinaryRes.secure_url,
            author: autherId,
        });
        const user = await User.findById(autherId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({
            path: `auther`,
            select: `-password`
        });
        return res.status(200).json({
            message: `New post added`,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const getAllPost = async (req, res) => {
    try {
        const post = await Post.find().sort({ createdAt: -1 })
            .populate({ path: `author`, select: `username, profilePhoto` })
            .populate({
                path: `comments`,
                sort: { createdAt: -1 },
                populate: {
                    path: `author`,
                    select: `username, profilePhoto`
                }
            })
        return res.status(200).json({
            post,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const getUsersAllPost = async (req, res) => {
    try {
        const authorId = req.id;
        const post = await Post.find({ auther: authorId }).sort({ createdAt: -1 })
            .populate({ path: `author`, select: `username, profilePhoto` })
            .populate({
                path: `comments`,
                sort: { createdAt: -1 },
                populate: {
                    path: `author`,
                    select: `username, profilePhoto`
                }
            })
        return res.status(200).json({
            post,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const manageLikePost = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const postId = req.params.id;
        const post = await post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: `No post available`,
                success: false,
            });
        }
        await Post.updateOne({ $addToSet: { likes: loggedInUserId } });
        await Post.save();
        return res.status(200).json({
            message: `Post Liked`,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const manageDislikePost = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const postId = req.params.id;
        const post = await post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: `No post available`,
                success: false,
            });
        }
        await Post.updateOne({ $pull: { likes: loggedInUserId } });
        await Post.save();
        return res.status(200).json({
            message: `Post Disliked`,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const addComment = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const postId = req.params.id;
        const { comment } = req.body;
        if (!comment) {
            return res.status(404).json({
                message: `Comment is required`,
                success: false,
            })
        }
        const post = await post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: `No post available`,
                success: false,
            });
        }
        const saveComment = await Comment.create({
            comment,
            post: postId,
            author: loggedInUserId,
        }).populate({
            path: `author`,
            select: `username, profilePhoto`,
        })
        post.comments.push(saveComment);
        await post.save();
        return res.status(201).json({
            message: `Comment added`,
            comment,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const getAllCommentsOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate({
            'author': 'username, profilePhoto',
        })
        if (!comments) {
            return res.status(404).json({
                message: `No comments for this post`,
                success: false,
            })
        }
        return res.status(201).json({
            comments,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const deletePost = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const postId = req.params.id;
        const post = await post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: `No post found`,
                success: false,
            });
        }
        if (post.author.toString !== loggedInUserId) {
            return res.status(403).json({ message: `UnAuthorized`, success: false });
        }
        await Post.findByIdAndDelete(postId);
        // remove post from user
        let user = await User.findById(loggedInUserId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // delete comments of post
        await Comment.deleteMany({ post: postId });
        return res.status(201).json({
            message: `Comment added`,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const loggedInUserId = req.id;
        const postId = req.params.id;

        const post = await post.findById(postId);
        if (!post) {
            return res.status(400).json({
                message: `No post available`,
                success: false,
            });
        }
        const user = await User.findById(loggedInUserId);
        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } })
            await user.save();
            return res.status(201).json({ message: `Bookmark removed`, success: true, })
        } else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } })
            await user.save();
            return res.status(201).json({ message: `Bookmark added`, success: true, })
        }
    } catch (err) {
        console.log(err);
    }
}