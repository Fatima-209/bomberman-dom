import {
    createPlayer,
    GAME_PHASE,
} from "../../../shared/gameState.js";

import { GAME_RULES } from "../../../shared/type.js";
import { MSG } from "../../../shared/events.js";

import { getGameState } from "../state/gameState.js";
import { broadcastToAll } from "../websocket/hub.js";

export function handleJoin(playerId, ws, message) {
    const state = getGameState();

    // Prevent the same player/connection from joining twice.
    if (state.players[playerId]) {
        send(ws, {
            type: MSG.JOIN_REJECTED,
            message: "You have already joined the lobby.",
        });

        return;
    }

    // No new players after the lobby phase
    if (state.phase !== GAME_PHASE.LOBBY) {
        send(ws, {
            type: MSG.JOIN_REJECTED,
            message: "The game has already started.",
        });

        return;
    }

    const currentPlayers = Object.values(state.players);

    if (currentPlayers.length >= GAME_RULES.MAX_PLAYERS) {
        send(ws, {
            type: MSG.JOIN_REJECTED,
            message: "The lobby is full.",
        });

        return;
    }

    const rawNickname =
        typeof message.nickname === "string"
            ? message.nickname
            : "";

    const nickname = rawNickname.trim();

    if (nickname.length === 0) {
        send(ws, {
            type: MSG.JOIN_REJECTED,
            message: "Please enter a nickname.",
        });

        return;
    }

    if (
        nickname.length >
        GAME_RULES.MAX_NICKNAME_LENGTH
    ) {
        send(ws, {
            type: MSG.JOIN_REJECTED,
            message:
                `Nickname must be ` +
                `${GAME_RULES.MAX_NICKNAME_LENGTH} ` +
                `characters or fewer.`,
        });

        return;
    }

    const normalizedNickname = nickname.toLowerCase();

    const nicknameIsTaken = currentPlayers.some(
        (player) =>
            player.nickname.toLowerCase() ===
            normalizedNickname,
    );

    if (nicknameIsTaken) {
        send(ws, {
            type: MSG.NICKNAME_TAKEN,
            message: "That nickname is already in use.",
        });

        return;
    }

    const player = createPlayer(playerId, nickname);
//add player to server state
    state.players[playerId] = player;
//browser recives new player as joined
    send(ws, {
        type: MSG.JOINED,
        player: toPublicPlayer(player),
    });

    broadcastPlayerList(state);
}
//update player list
function broadcastPlayerList(state) {
    const players = Object.values(state.players).map(
        toPublicPlayer,
    );

    broadcastToAll({
        type: MSG.PLAYER_LIST_UPDATE,
        players,
        count: players.length,
        maximum: GAME_RULES.MAX_PLAYERS,
    });
}
//contains internal game info & wht is sent to the browsers
function toPublicPlayer(player) {
    return {
        id: player.id,
        nickname: player.nickname,
        connected: player.connected,
        lives: player.lives,
        isOut: player.isOut,
    };
}

function send(ws, message) {
    if (ws.readyState !== 1) {
        return;
    }

    ws.send(JSON.stringify(message));
}