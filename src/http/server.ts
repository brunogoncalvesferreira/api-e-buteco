import { app } from "./app.ts";
import { Server } from "socket.io";

const PORT = 3333;

// Create Socket.io server (will be initialized after app.ready())
let io: Server;

// Initialize server in async function to avoid top-level await
(async () => {
  await app.ready();

  // Create Socket.io server
  io = new Server(app.server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://ebuteco.vercel.app",
        "https://ebuteco.com",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
})();

// Export io getter function
export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized yet");
  }
  return io;
}
