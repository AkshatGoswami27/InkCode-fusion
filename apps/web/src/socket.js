import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export const initSocket = async () => {
  try {
    await fetch(SOCKET_URL);
  } catch (e) {}

  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 30000,
    transports: ["websocket"],
  };
  return io(SOCKET_URL, options);
};