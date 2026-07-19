import { WebSocketServer } from "ws";

import { MSG } from "../../../shared/events.js";
import { handleJoin } from "../handlers/joingameHandler.js";
import { addClient, removeClient } from "./hub.js";

const ALLOWED_ORIGINS = ["http://localhost:3000"];

export function startWebSocketServer(port) {
    const wss = new WebSocketServer({ port });

    wss.on("connection", (ws, request) => {
        const origin = request.headers.origin;

        if (!ALLOWED_ORIGINS.includes(origin)) {
            ws.close(1008, "Origin not allowed");
            return;
        }

        const playerId =
            "player-" +
            Date.now() +
            "-" +
            Math.floor(Math.random() * 1000);

        addClient(playerId, ws);

        console.log(`Client connected: ${playerId}`);

        ws.isAlive = true;

        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", (data) => {
            let message;

            try {
                message = JSON.parse(data.toString());
            } catch {
                console.warn(
                    `Invalid JSON received from ${playerId}`,
                );
                return;
            }

            if (
                message === null ||
                typeof message !== "object" ||
                Array.isArray(message) ||
                typeof message.type !== "string"
            ) {
                console.warn(
                    `Invalid message received from ${playerId}`,
                );
                return;
            }
//only added join, need to add other event types move place bomb etc
            switch (message.type) {
                case MSG.JOIN:
                    handleJoin(playerId, ws, message);
                    break;

                default:
                    console.warn(
                        `Unknown message type "${message.type}" ` +
                        `received from ${playerId}`,
                    );
            }
        });

        ws.on("close", () => {
            removeClient(playerId);

            console.log(`Client disconnected: ${playerId}`);
        });

        ws.on("error", (error) => {
            console.error(
                `Client error for ${playerId}:`,
                error.message,
            );
        });
    });

    wss.on("error", (error) => {
        console.error(
            "WebSocket server error:",
            error.message,
        );
    });

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

    function shutdown() {
        clearInterval(interval);

        for (const ws of wss.clients) {
            ws.close(1001, "Server shutting down");
        }

        wss.close(() => {
            console.log("WebSocket server stopped");
        });
    }

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);

    return wss;
}