import { TILE_TYPE, GAME_RULES, POWER_UP_TYPE } from "../../../shared/type.js";
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

    collectPowerUpIfPresent(player, state);
}

function collectPowerUpIfPresent(player, state) {
    const index = state.powerUps.findIndex(
        (powerUp) =>
            powerUp.position.row === player.position.row &&
            powerUp.position.col === player.position.col,
    );

    if (index === -1) return;

    const [powerUp] = state.powerUps.splice(index, 1);

    applyPowerUpEffect(player, powerUp.type);

    broadcastToAll({
        type: MSG.POWER_UP_COLLECTED,
        playerId: player.id,
        position: powerUp.position,
        powerUpType: powerUp.type,
        maxBombs: player.maxBombs,
        flameRange: player.flameRange,
        speedLevel: player.speedLevel,
    });
}

function applyPowerUpEffect(player, type) {
    if (type === POWER_UP_TYPE.BOMBS) {
        player.maxBombs += 1;
    } else if (type === POWER_UP_TYPE.FLAMES) {
        player.flameRange += 1;
    } else if (type === POWER_UP_TYPE.SPEED) {
        player.speedLevel += 1;
    }
}

function isValidMove(row, col, state) {
    // out of map bounds
    if (row < 0 || row >= GAME_RULES.MAP_ROWS) return false;
    if (col < 0 || col >= GAME_RULES.MAP_COLS) return false;

    const tile = state.map.tiles[row][col];

    // wall or unbroken block
    if (tile === TILE_TYPE.WALL)  return false;
    if (tile === TILE_TYPE.BLOCK) return false;

    // another player is on that tile AND theyre connected (so disconnected players arent blocking tiles)
const tileOccupied = Object.values(state.players).some(
    (p) => p.connected && !p.isOut && p.position.row === row &&p.position.col === col
);
    if (tileOccupied) return false;

    // Stage 3.1 will add: if tile is TILE_TYPE.BOMB return false
    const bombOccupied = state.bombs.some(
        (bomb) =>
            bomb.position.row === row &&
            bomb.position.col === col,
    );

    if (bombOccupied) return false;

    return true;
}