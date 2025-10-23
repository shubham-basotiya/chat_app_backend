const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chat", chatRoutes);

// Socket.io for realtime messaging
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (msg) => {
    io.emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch(err => console.error(err));