import { io } from "socket.io-client";

export const initSocket = async () => {
  try {
    await fetch(process.env.REACT_APP_SOCKET_URL);
  } catch (e) {}

  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 30000,
    transports: ["websocket"],
  };
  return io(process.env.REACT_APP_SOCKET_URL, options);
};