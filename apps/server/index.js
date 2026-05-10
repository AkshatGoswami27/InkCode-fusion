const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./Actions");
const cors = require("cors");

app.use(cors());

// Function to run code using local Python
async function runCodeWithPython(code) {
  const { spawn } = require('child_process');
  const candidates = ['python3', 'python'];
  let pythonCommand;

  for (const command of candidates) {
    try {
      const process = spawn(command, ['--version']);
      await new Promise((resolve, reject) => {
        process.on('error', reject);
        process.on('exit', (exitCode) => {
          if (exitCode === 0) resolve();
          else reject(new Error('Python command failed'));
        });
      });
      pythonCommand = command;
      break;
    } catch (err) {
      continue;
    }
  }

  if (!pythonCommand) {
    throw new Error('Python executable not found on the host');
  }

  return new Promise((resolve, reject) => {
    const python = spawn(pythonCommand, ['-c', code]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code });
    });

    python.on('error', (error) => {
      reject(error);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      python.kill();
      reject(new Error('Code execution timed out'));
    }, 10000);
  });
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
      const result = await runCodeWithPython(code);
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