import { Server, type Socket } from "socket.io";
import { type Client } from "discord.js";

export function start(client: Client) {
  const io = new Server();

  io.on("connection", (socket: Socket) => {
    console.log(`Server connected on ${socket.client}`);

    client.on("ready", () => {
      socket.emit("isReady", true);
    });

    socket.on("disconnect", () => {
      console.log(`Server disconnected on ${socket.client}`);
    });
  });

  console.log(process.env.SOCKET_PORT);
  io.listen(parseInt(process.env.SOCKET_PORT));
}
