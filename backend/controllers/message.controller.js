import Conversation from "../models/conversation.models.js";
import Message from "../models/message.models.js";

export const sendMessage = async(req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id;
        const {message} = req.id;

        let conversation = await Conversation.findOne({
            participants: {$all : [senderId, recieverId]},
        })
        if(!conversation) {
            conversation = await Conversation.create({
                participants: {$all : [senderId, recieverId]},
            })
        };
        const newMessage = new Message.create({
            senderId, recieverId, message
        });
        if(newMessage) {
            conversation.messages.push(newMessage._id);
        }
        // to handle multiple documents at a time
        await Promise.all([conversation.save(), newMessage.save()]);
        return res.status(201).json({
            newMessage,
            success: true, 
        })
    } catch (err) {
        console.log(err);
    }
}

export const getMessage = async(req, res) => {
    try {
        const senderId = req.id;
        const recieverId = req.params.id;

        let conversation = await Conversation.find({
            participants: {$all : [senderId, recieverId]},
        })
        if(!conversation) {
            return res.status(200).json({message: [], success: true});
        };
        return res.status(200).json({message: conversation, success: true});
    } catch (err) {
        console.log(err);
    }
}