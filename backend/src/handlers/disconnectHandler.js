import { GAME_PHASE } from "../../../shared/gameState.js";

import { getGameState } from "../state/gameState.js";
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

    // game already ended, nothing left to update
    if (state.phase === GAME_PHASE.GAME_OVER) {
        return;
    }

    const isLobbyPhase =
        state.phase === GAME_PHASE.LOBBY ||
        state.phase === GAME_PHASE.COUNTDOWN;

    if (isLobbyPhase) {
        delete state.players[playerId];

        onPlayerLeft(state);
        broadcastPlayerList(state);
        return;
    }

    // mid-game: keep the player entry so win-condition checks can still
    // see who's connected/out, just mark them disconnected
    player.connected = false;

    broadcastPlayerList(state);

    checkWinCondition(state, "disconnect");
}
