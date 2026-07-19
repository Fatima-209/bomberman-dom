// Tracks every connected client, keyed by playerId. This is the one
// place that knows "who is who" — websocket.js only knows raw sockets,
// this file is what turns a socket into a tracked player.

const clients = new Map();

export function addClient(playerId, ws) {
    clients.set(playerId, ws);
}

export function removeClient(playerId) {
    clients.delete(playerId);
}

export function getClient(playerId) {
    return clients.get(playerId);
}

export function getAllPlayerIds() {
    return Array.from(clients.keys());
}

// send a message to everyone except one player (usually the sender)
export function broadcast(message, exceptPlayerId) {
    const payload = JSON.stringify(message);

    for (const [playerId, ws] of clients) {
        if (playerId === exceptPlayerId) {
            continue;
        }
        if (ws.readyState === 1) {
            ws.send(payload);
        }
    }
}

// send a message to literally everyone, including the sender
export function broadcastToAll(message) {
    const payload = JSON.stringify(message);

    for (const [, ws] of clients) {
        if (ws.readyState === 1) {
            ws.send(payload);
        }
    }
}