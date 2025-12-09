const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get profile (self)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("contacts", "username email")
    .populate("requests", "username email");
  res.json(user);
});

// Send chat request
router.post("/:id/request", auth, async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) return res.status(404).json({ error: "User not found" });

  targetUser.requests.push(req.user.id);
  await targetUser.save();

  res.json({ msg: "Chat request sent" });
});

// Accept chat request
router.post("/:id/accept", auth, async (req, res) => {
  const requester = await User.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!requester) return res.status(404).json({ error: "Requester not found" });

  user.contacts.push(requester._id);
  requester.contacts.push(user._id);
  user.requests = user.requests.filter(r => r.toString() !== requester._id.toString());

  await user.save();
  await requester.save();

  res.json({ msg: "Request accepted" });
});


// Get all users (for testing purposes)
router.get("/users", auth, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.id } }).select("username email _id");
  res.json(users);
});

module.exports = router;