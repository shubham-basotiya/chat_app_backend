const express = require("express");
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

const router = express.Router();

// Send message
router.post("/:id/send", auth, async (req, res) => {
  const newMessage = new Message({
    senderId: req.user.id,
    receiverId: req.params.id,
    content: req.body.content
  });
  await newMessage.save();
  res.json(newMessage);
});

// Get chat history
router.get("/:id/history", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { senderId: req.user.id, receiverId: req.params.id },
      { senderId: req.params.id, receiverId: req.user.id }
    ]
  }).sort({ timestamp: 1 });

  res.json(messages.filter(msg => !msg.deletedFor.includes(req.user.id)));
});

// Clear chat
router.delete("/:id/clear", auth, async (req, res) => {
  await Message.updateMany(
    {
      $or: [
        { senderId: req.user.id, receiverId: req.params.id },
        { senderId: req.params.id, receiverId: req.user.id }
      ]
    },
    { $addToSet: { deletedFor: req.user.id } }
  );
  res.json({ msg: "Chat cleared for you" });
});

module.exports = router;