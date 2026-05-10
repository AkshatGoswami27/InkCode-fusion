const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require("cors");
const redis = require("redis");

app.use(cors());

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
const subClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function startRedis() {
  try {
    await client.connect();
    console.log("Connected to Redis");
    await subClient.connect();
    console.log("Connected to Redis for subscribing");
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startRedis();

// Function to run code using Piston API
async function runCodeWithPiston(code) {
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "python",
      version: "3.10.0",
      files: [{ content: code }],
    }),
  });
  const result = await response.json();
  return result.run;
}

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userName: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("got a connection on server", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    console.log("clients", clients);
    clients.forEach((socketId) => {
      io.to(socketId.socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId,
      });
    });
  });

  socket.on(ACTIONS.SEND_MESSAGE, (data) => {
    socket.in(data.room).emit(ACTIONS.RECEIVE_MESSAGE, data);
  });

  socket.on(ACTIONS.RUN_CODE, async ({ code, roomId }) => {
    try {
      console.log("Running code for room:", roomId);
      const result = await runCodeWithPiston(code);
      console.log("Code result:", result);
      const output = result.stdout || result.stderr || "No output";
      io.to(roomId).emit(ACTIONS.OUTPUT, { data: output });
    } catch (error) {
      console.error("Error running code:", error);
      io.to(roomId).emit(ACTIONS.OUTPUT, { data: "Error running code. Please try again." });
    }
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));