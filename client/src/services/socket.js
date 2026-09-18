import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = import.meta.env.VITE_API_URL || "/";

export function getSocket(userId) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected to server, id:", socket.id);
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Disconnected from server");
    });
  } else if (userId) {
    socket.emit("join", userId);
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}