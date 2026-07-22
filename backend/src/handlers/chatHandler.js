import { MSG } from "../../../shared/events.js";
import { broadcastToAll } from "../websocket/hub.js";

const MAX_CHAT_MESSAGE_LENGTH = 200;

export function handleChatMessage(playerId, message, state) {
    const player = state.players[playerId];

    // no messages from players who are disconnected
    if (!player || !player.connected) return;

    const rawText =
        typeof message.text === "string"
            ? message.text
            : "";

    const text = rawText.trim();

    // no empty messages
    if (text.length === 0) return;

    broadcastToAll({
        type: MSG.CHAT_MESSAGE,
        playerId: player.id,
        nickname: player.nickname,
        text: text.slice(0, MAX_CHAT_MESSAGE_LENGTH),
        sentAt: Date.now(),
    });
}