import { startHttpServer } from "./httpServer.js";
import { startWebSocketServer } from "./websocket/websocket.js";

const HTTP_PORT = 3000;
const WEBSOCKET_PORT = 8080;

const httpServer = startHttpServer(HTTP_PORT);
startWebSocketServer(WEBSOCKET_PORT, httpServer);

console.log(
    `WebSocket server listening at ws://localhost:${WEBSOCKET_PORT}`,
);