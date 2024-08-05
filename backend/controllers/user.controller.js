import User from "../models/user.models.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const userRegister = async (req, res) => {
    const { username, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) {
        return res.status(401).json({
            message: `Email already used.`,
            success: false,
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ username, email, password: hashedPassword });
    try {
        await newUser.save();
        return res.status(201).json({
            message: `User created successfully`,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!user || !isPasswordMatch) {
            return res.status(401).json({
                message: `Incorrect Email or Password.`,
                success: false,
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
        res.cookie('access_token', token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'scrict',
        }).status(200).json(user);
    } catch (err) {
        console.log(err);
    }
}

export const userLogout = async (req, res) => {
    try {
        res.clearCookie('access_token');
        res.status(200).json({
            message: 'User has been logged out successfully',
            success: true,
        });
    } catch (err) {
        console.log(err);
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        return res.status(200).json({
            user,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const editUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePhoto = req.file;
        const user = await User.findById(userId);
        let cloudinaryRes = '';

        if (profilePhoto) {
            const fileUri = getDataUri(profilePhoto);
            cloudinaryRes = await cloudinary.uploader.upload(fileUri);
            user.profilePhoto = cloudinaryRes.secure_url;
        }
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;

        await user.save();
        return res.status(200).json({
            message: `Profile Updated`,
            success: true,
            user: user,
        })
    } catch (err) {
        console.log(err);
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUser = await User.find({ _id: { $ne: req.id } }.select('-password'));
        if (!suggestedUser) {
            return res.status(401).json({
                message: 'Does not have any suggestion for users',
                success: false,
            })
        }
        return res.status(401).json({
            users: suggestedUser,
            success: true,
        })
    } catch (err) {
        console.log(err);
    }
}

export const manageFollowers = async (req, res) => {
    try {
        const follower = req.id; //logged in User
        const following = req.params.id;
        const user = await User.findById(follower);
        const targetUser = await User.findById(following);
        
        if(!user || !targetUser) {
            return res.status(401).json({
                message: 'User not available',
                success: false,
            })
        }

        const isFollowing = user.followings.includes(following);

        if(isFollowing) {
            await Promise.all([
                user.updateOne({_id: follower}, {$pull: {followings : following}}),
                user.updateOne({_id: following}, {$pull: {followings : follower}})
            ]);
            return res.status(200).json({
                message: `Unfollowed Successfully`,
                success: true,
            })
        } else {
            await Promise.all([
                user.updateOne({_id: follower}, {$push: {followings : following}}),
                user.updateOne({_id: following}, {$push: {followings : follower}})
            ]);
            return res.status(200).json({
                message: `Followed Successfully`,
                success: true,
            })
        }
    } catch (err) {
        console.log(err);
    }

}

