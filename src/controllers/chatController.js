import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Faq from "../models/FAQ.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const chats = await Chat.find({ userId })
      .populate("adminId", "username")
      .sort({ createdAt: 1, _id: 1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;
    const sender = req.user.role === "admin" ? "admin" : "user";
    const adminId = req.user.role === "admin" ? req.user._id : null;

    // Find or create conversation
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = await Conversation.create({ userId });
    }

    const chat = await Chat.create({
      sender,
      userId,
      message,
      conversationId: conversation._id,
      adminId,
      seenByAdmin: sender === "admin",
    });

    // Update conversation last message
    conversation.lastMessage = chat._id;
    await conversation.save();

    if (req.io) {
      req.io.to(userId.toString()).emit("newMessage", chat);
      req.io.to("admins").emit("newMessage", chat);
    }

    res.status(201).json({ chat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("userId", "username email")
      .populate({
        path: "lastMessage",
        select: "message createdAt sender",
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const markAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    await Chat.updateMany(
      { userId, sender: "user", seenByAdmin: false },
      { $set: { seenByAdmin: true } },
    );

    if (req.io) {
      req.io.to(userId.toString()).emit("messagesSeen", { userId });
    }

    res.status(200).json({ message: "Messages marked as seen." });
  } catch (error) {
    console.error("markAsSeen error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const sendFaqAutoReply = async (req, res) => {
  try {
    const { userId, faqId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    if (!mongoose.Types.ObjectId.isValid(faqId)) {
      return res.status(400).json({ message: "Invalid faqId" });
    }
    
    const faq = await Faq.findById(faqId);
    if (!faq) return res.status(404).json({ message: "FAQ not found." });

    // Find or create conversation
    let conversation = await Conversation.findOne({ userId });
    if (!conversation) {
      conversation = await Conversation.create({ userId });
    }

    const questionChat = await Chat.create({
      sender: "user",
      userId,
      message: faq.question,
      conversationId: conversation._id,
      seenByAdmin: false,
    });

    const answerChat = await Chat.create({
      sender: "admin",
      userId,
      message: faq.answer,
      conversationId: conversation._id,
      seenByAdmin: true,
    });

    conversation.lastMessage = answerChat._id;
    await conversation.save();

    if (req.io) {
      req.io.to("admins").emit("newMessage", questionChat);
      req.io.to(userId.toString()).emit("newMessage", questionChat);

      req.io.to("admins").emit("newMessage", answerChat);
      req.io.to(userId.toString()).emit("newMessage", answerChat);
    }

    return res.status(201).json({ questionChat, answerChat });
  } catch (error) {
    console.error("sendFaqAutoReply error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
