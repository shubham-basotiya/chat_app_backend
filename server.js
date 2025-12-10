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

const app = express();
const server = http.createServer(app);
app.options('*', cors()); // Enable pre-flight across-the-board
const io = new Server(server, {
  cors: {
    origin: [
         "https://chat-app-frontend-gljd.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"], // IMPORTANT on Render
});

// Middleware
app.use(cors({
  origin: [
    "https://chat-app-frontend-gljd.onrender.com"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://chat-app-frontend-gljd.onrender.com");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});


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
    server.listen(5000, () => console.log("Server running on port 5000 🚀"));
  })
  .catch(err => console.error(err));