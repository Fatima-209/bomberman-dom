import { GAME_PHASE } from "../../../shared/gameState.js";
import { MSG } from "../../../shared/events.js";
import { broadcastToAll } from "../websocket/hub.js";
// win
// Single reusable win-condition check, called after an explosion resolves
// and after a disconnect - both paths just report why they're checking.
export function checkWinCondition(state, reason) {
    if (state.phase !== GAME_PHASE.PLAYING) {
        return;
    }

    const activePlayers = Object.values(state.players).filter(
        (player) => player.connected && !player.isOut,
    );

    if (activePlayers.length > 1) {
        return;
    }

    const winner = activePlayers.length === 1 ? activePlayers[0] : null;

    state.phase = GAME_PHASE.GAME_OVER;
    state.winnerId = winner ? winner.id : null;

    broadcastToAll({
        type: MSG.GAME_OVER,
        winnerId: state.winnerId,
        winnerNickname: winner ? winner.nickname : null,
        reason: winner ? reason : "draw",
    });
}
