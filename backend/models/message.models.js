import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    recieverId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    message: {
        type:String,
        required: true,
    },
})

const Message = mongoose.model('Comment', messageSchema);

export default Message;