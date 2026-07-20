import { TILE_TYPE, GAME_RULES } from "../../../shared/type.js";
import { broadcastToAll } from "../websocket/hub.js";
import { MSG } from "../../../shared/events.js";
import { GAME_PHASE } from "../../../shared/gameState.js";

const DIRECTION_DELTAS = {
    up:    { row: -1, col: 0 },
    down:  { row: 1,  col: 0 },
    left:  { row: 0,  col: -1 },
    right: { row: 0,  col: 1 },
};

export function handleMove(playerId, message, state) {
    // ignore moves if the game isn't running
    if (state.phase !== GAME_PHASE.PLAYING) return;

    const player = state.players[playerId];

    // ignore if player doesn't exist or is out of the game
    if (!player || player.isOut) return;

    const direction = message.direction;
    const delta = DIRECTION_DELTAS[direction];

    // ignore unknown directions
    if (!delta) return;

    const newRow = player.position.row + delta.row;
    const newCol = player.position.col + delta.col;

    // check collision,if invalid, do nothing, player stays put
    if (!isValidMove(newRow, newCol, state)) return;

    // move is valid, update position and tell everyone
    player.position.row = newRow;
    player.position.col = newCol;

    broadcastToAll({
        type: MSG.POSITION_UPDATE,
        playerId,
        position: { row: newRow, col: newCol },
    });
}

function isValidMove(row, col, state) {
    // out of map bounds
    if (row < 0 || row >= GAME_RULES.MAP_ROWS) return false;
    if (col < 0 || col >= GAME_RULES.MAP_COLS) return false;

    const tile = state.map.tiles[row][col];

    // wall or unbroken block
    if (tile === TILE_TYPE.WALL)  return false;
    if (tile === TILE_TYPE.BLOCK) return false;

    // another player is on that tile
    const tileOccupied = Object.values(state.players).some(
        (p) => !p.isOut && p.position.row === row && p.position.col === col
    );
    if (tileOccupied) return false;

    // Stage 3.1 will add: if tile is TILE_TYPE.BOMB return false
    return true;
}