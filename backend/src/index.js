import { startWebSocketServer } from "./websocket/websocket.js";

const PORT = 8080;

startWebSocketServer(PORT);

console.log("backend listening on ws://localhost:" + PORT);