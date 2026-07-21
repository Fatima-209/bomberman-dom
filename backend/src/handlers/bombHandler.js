import { GAME_PHASE } from "../../../shared/gameState.js";
import {
    GAME_RULES,
    TILE_TYPE,
} from "../../../shared/type.js";
import { MSG } from "../../../shared/events.js";
import { broadcastToAll } from "../websocket/hub.js";

const BLAST_DIRECTIONS = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
];

export function handlePlaceBomb(playerId, state) {
    // ignore bomb placement if the game isn't running
    if (state.phase !== GAME_PHASE.PLAYING) return;

    const player = state.players[playerId];

    // ignore if player doesn't exist, is disconnected, or is out
    if (
        !player ||
        !player.connected ||
        player.isOut ||
        !player.position
    ) {
        return;
    }

    // player cannot exceed their current bomb limit
    if (player.activeBombs >= player.maxBombs) return;

    const row = player.position.row;
    const col = player.position.col;

    // only one bomb can exist on a tile
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

    setTimeout(() => {
        explodeBomb(bomb.id, state);
    }, GAME_RULES.BOMB_FUSE_MS);
}

function explodeBomb(bombId, state) {
    const bombIndex = state.bombs.findIndex(
        (bomb) => bomb.id === bombId,
    );

    // bomb may already have been removed
    if (bombIndex === -1) {
        return;
    }

    const [bomb] = state.bombs.splice(
        bombIndex,
        1,
    );

    restoreOwnerBombCount(bomb, state);

    // still remove the bomb if the game ended during its fuse
    if (
        state.phase !== GAME_PHASE.PLAYING ||
        !state.map
    ) {
        return;
    }

    const explosionTiles =
        calculateExplosionTiles(bomb, state);

    destroyBlocks(explosionTiles, state);

    broadcastToAll({
        type: MSG.EXPLOSION,
        explosion: {
            id: `explosion-${bomb.id}-${Date.now()}`,
            bombId: bomb.id,
            ownerId: bomb.ownerId,
            tiles: explosionTiles,
            durationMs:
                GAME_RULES.EXPLOSION_DURATION_MS,
        },
    });
}

function restoreOwnerBombCount(bomb, state) {
    const owner = state.players[bomb.ownerId];

    if (!owner) {
        return;
    }

    owner.activeBombs = Math.max(
        0,
        owner.activeBombs - 1,
    );
}

function calculateExplosionTiles(bomb, state) {
    const explosionTiles = [
        {
            row: bomb.position.row,
            col: bomb.position.col,
        },
    ];

    for (const direction of BLAST_DIRECTIONS) {
        addTilesInDirection(
            explosionTiles,
            bomb,
            direction,
            state,
        );
    }

    return explosionTiles;
}

function addTilesInDirection(
    explosionTiles,
    bomb,
    direction,
    state,
) {
    for (
        let distance = 1;
        distance <= bomb.range;
        distance++
    ) {
        const row =
            bomb.position.row +
            direction.row * distance;

        const col =
            bomb.position.col +
            direction.col * distance;

        const tile = state.map.tiles[row]?.[col];

        // stop if the explosion reaches outside the map
        if (tile === undefined) {
            break;
        }

        // walls stop the explosion and are not affected
        if (tile === TILE_TYPE.WALL) {
            break;
        }

        explosionTiles.push({
            row,
            col,
        });

        // blocks are affected but stop the explosion
        if (tile === TILE_TYPE.BLOCK) {
            break;
        }

        // an active bomb stops the flame and keeps its own fuse
        const bombOnTile = state.bombs.some(
            (activeBomb) =>
                activeBomb.position.row === row &&
                activeBomb.position.col === col,
        );

        if (bombOnTile) {
            break;
        }
    }
}

function destroyBlocks(explosionTiles, state) {
    for (const position of explosionTiles) {
        const tile =
            state.map.tiles[position.row][position.col];

        if (tile !== TILE_TYPE.BLOCK) {
            continue;
        }

        state.map.tiles[position.row][position.col] =
            TILE_TYPE.EMPTY;

        broadcastToAll({
            type: MSG.BLOCK_DESTROYED,
            position,
        });
    }
}