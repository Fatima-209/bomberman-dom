import { MSG } from "../../shared/events.js";
let socket = null;
const messageListeners = [];

export function connect(serverUrl) {
    socket = new WebSocket(serverUrl);

    socket.onopen = () => {
        console.log("connected to server");
    };

    socket.onclose = (event) => {
        console.log(
            "disconnected:",
            event.code,
            event.reason,
        );
    };

    socket.onerror = (error) => {
        console.error("socket error:", error);
    };

    socket.onmessage = (event) => {
        let message;

        try {
            message = JSON.parse(event.data);
        } catch {
            console.error(
                "Received invalid JSON from the server.",
            );
            return;
        }

        console.log("received:", message);
//now every listener runs the message
        for (const listener of messageListeners) {
            listener(message);
        }
    };

    return socket;
}

export function send(message) {
    if (
        !socket ||
        socket.readyState !== WebSocket.OPEN
    ) {
        console.error(
            "Tried to send before connection was open:",
            message,
        );
        return;
    }

    socket.send(JSON.stringify(message));
}

export function sendChatMessage(rawText) {
    const text =
        typeof rawText === "string"
            ? rawText.trim()
            : "";

    if (text.length === 0) {
        return;
    }

    send({
        type: MSG.CHAT_MESSAGE,
        text,
    });
}
//adds function to the list of functions that should run whenever the server sends something
export function onMessage(listener) {
    if (typeof listener !== "function") {
        return;
    }

    messageListeners.push(listener);
}