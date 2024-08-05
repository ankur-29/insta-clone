import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: {
        type:String,
        default:'',
    },
    image: {
        type: String,
        reuired: true,
    },
    author: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        require : true,
    },
    likes: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
    }],
})

const Post = mongoose.model("Post", postSchema);

export default Post;