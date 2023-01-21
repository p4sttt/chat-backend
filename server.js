require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const mongoose = require("mongoose");

const cors = require("cors");
const Chat = require("./models/Chat");

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

io.on("connection", (socket) => {
  console.log(socket.id, "connected");
  socket.on("CHAT:JOIN", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.to(roomId).emit("CHAT:JOINED", userName);
  });
  socket.on("CHAT:LEAVE", (roomId) => {
    socket.leave(roomId)
  });
  socket.on("MESSAGE:SEND", ({ message, roomId }) => {
    io.in(roomId).emit("MESSAGE:RECIVE", message);
  });
});

io.on("disconnect", (socket) => {
  console.log(socket.id, "disconnected");
});

app.get("/", (req, res) => {
  res.json({ message: "success" });
});

app.get("/login", (req, res) => {
  res.json({ message: "success" });
});

app.post("/create", (req, res) => {
  const { roomId } = req.body;
  const chat = new Chat({
    roomId: roomId,
    messages: [],
  });
  chat.save((err) => {
    if (err) return console.log(err);
  });
  res.status(200).json({ msg: "success" });
});

app.post("/connect", async (req, res) => {
  const { id } = req.body;
  const chat = await Chat.findOne({ roomId: id }, "date messages roomId");
  if (chat === null) {
    return res.status(400).json({ message: "chat not found" });
  }
  const { roomId, messages, date } = chat;
  return res.status(200).json({
    roomId,
    messages,
    date,
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, (err) => {
  if (err) {
    throw new Error(err);
  }
  mongoose.set("strictQuery", false);
  mongoose.connect(
    process.env.DB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (!err) console.log("db connected");
      else console.log(err);
    }
  );
  console.log(`server has been started on port ${PORT}`);
});
