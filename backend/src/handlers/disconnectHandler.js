import { GAME_PHASE } from "../../../shared/gameState.js";

import { getGameState, resetGameState } from "../state/gameState.js";
import { broadcastPlayerList } from "./joingameHandler.js";
import { onPlayerLeft } from "./lobbyTimerHandler.js";
import { checkWinCondition } from "./winConditionHandler.js";

export function handleDisconnect(playerId) {
    const state = getGameState();
    const player = state.players[playerId];

    // socket closed before ever completing nickname entry
    if (!player) {
        return;
    }

    const isLobbyPhase =
        state.phase === GAME_PHASE.LOBBY ||
        state.phase === GAME_PHASE.COUNTDOWN;

    if (isLobbyPhase) {
        delete state.players[playerId];

        onPlayerLeft(state);
        broadcastPlayerList(state);
    } else if (state.phase === GAME_PHASE.GAME_OVER) {
        // the match is already decided - there's no win-condition left
        // to check, just remove this player so a finished game doesn't
        // keep them (and the server) stuck forever.
        delete state.players[playerId];

        broadcastPlayerList(state);
    } else {
        // mid-game: keep the player entry so win-condition checks can
        // still see who's connected/out, just mark them disconnected
        player.connected = false;

        broadcastPlayerList(state);

        checkWinCondition(state, "disconnect");
    }

    // check the MATCH itself, not the whole server - other open tabs
    // that never joined (still on the nickname screen) shouldn't block
    // a reset. Only look at players who were actually part of this
    // game: if none of them are still connected, there's nobody left
    // for this match to matter to, so start a fresh lobby.
    if (state.phase !== GAME_PHASE.LOBBY) {
        const anyoneStillConnected = Object.values(state.players).some(
            (remainingPlayer) => remainingPlayer.connected,
        );

        if (!anyoneStillConnected) {
            resetGameState();
        }
    }
}