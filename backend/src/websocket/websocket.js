import { WebSocketServer } from "ws";
import { addClient, removeClient, broadcast } from "./hub.js";

// Update this to match whatever port your frontend is actually served
// on. Check your terminal when you run the frontend's dev server —
// it prints the real port, which is not always the one you expect.
const ALLOWED_ORIGINS = ["http://localhost:3000"];

export function startWebSocketServer(port) {
    const wss = new WebSocketServer({ port: port });

    wss.on("connection", (ws, request) => {
        const origin = request.headers.origin;

        if (!ALLOWED_ORIGINS.includes(origin)) {
            ws.close(1008, "Origin not allowed");
            return;
        }

        // placeholder id until Stage 1.1 (nickname entry) assigns a
        // real one tied to a validated nickname
        const playerId = "player-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        addClient(playerId, ws);

        ws.isAlive = true;
        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", (data) => {
            let message;

            try {
                message = JSON.parse(data);
            } catch {
                ws.send(JSON.stringify({ error: "Invalid JSON" }));
                return;
            }

            broadcast(message, playerId);
        });

        ws.on("close", () => {
            removeClient(playerId);
        });

        ws.on("error", (err) => {
            console.error("Client error:", err.message);
        });
    });

    // ping/pong dead-connection cleanup — checks every client, does
    // NOT stop checking the rest just because one was dead
    const interval = setInterval(() => {
        for (const ws of wss.clients) {
            if (!ws.isAlive) {
                ws.terminate();
                continue;
            }
            ws.isAlive = false;
            ws.ping();
        }
    }, 30000);

    process.on("SIGTERM", () => {
        clearInterval(interval);
        for (const ws of wss.clients) {
            ws.close(1001, "Server shutting down");
        }
        wss.close(() => process.exit(0));
    });

    return wss;
}