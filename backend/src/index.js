import { startHttpServer } from "./httpServer.js";
import { startWebSocketServer } from "./websocket/websocket.js";

const HTTP_PORT = 3000;
const WEBSOCKET_PORT = 8080;

startHttpServer(HTTP_PORT);
startWebSocketServer(WEBSOCKET_PORT);

console.log(
    `WebSocket server listening at ws://localhost:${WEBSOCKET_PORT}`,
);