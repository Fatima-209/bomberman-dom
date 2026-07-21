import { GAME_PHASE } from "../../../shared/gameState.js";
import { GAME_RULES } from "../../../shared/type.js";
import { MSG } from "../../../shared/events.js";
import { broadcastToAll } from "../websocket/hub.js";

export function handlePlaceBomb(playerId, state) {
    // no bombs unless game state is playing
    if (state.phase !== GAME_PHASE.PLAYING) return;

    const player = state.players[playerId];

    // if player doesnt exist / disconnected / out
    if (
        !player ||
        !player.connected ||
        player.isOut ||
        !player.position
    ) {
        return;
    }

    // player cant exceed their max bombs
    if (player.activeBombs >= player.maxBombs) return;

    const row = player.position.row;
    const col = player.position.col;

    // only one bomb per tile
    const bombAlreadyExists = state.bombs.some(
        (bomb) =>
            bomb.position.row === row &&
            bomb.position.col === col,
    );

    if (bombAlreadyExists) return;

    const placedAt = Date.now();

    const bomb = {
        id: `bomb-${playerId}-${placedAt}`,
        ownerId: playerId,
        position: {
            row,
            col,
        },
        range: player.flameRange,
        placedAt,
        explodesAt:
            placedAt + GAME_RULES.BOMB_FUSE_MS,
    };

    state.bombs.push(bomb);
    player.activeBombs += 1;

    broadcastToAll({
        type: MSG.BOMB_PLACED,
        bomb,
    });
}