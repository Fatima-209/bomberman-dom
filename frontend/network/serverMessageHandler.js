import { MSG } from "../../shared/events.js";
import { GAME_PHASE } from "../../shared/gameState.js";
import { gameStore } from "../state/gameStore.js";
import { startGameLoop, stopGameLoop } from "../app/game/inputHandler.js";
import {
    GAME_RULES,
    TILE_TYPE,
} from "../../shared/type.js";

export function handleServerMessage(message) {
    switch (message.type) {
        case MSG.JOINED:
            handleJoinedMessage(message);
            break;

        case MSG.NICKNAME_TAKEN:
        case MSG.JOIN_REJECTED:
            handleJoinErrorMessage(message);
            break;

        case MSG.PLAYER_LIST_UPDATE:
            handlePlayerListMessage(message);
            break;

        case MSG.CHAT_MESSAGE:
            handleChatMessage(message);
            break;

        case MSG.COUNTDOWN_TICK:
            handleCountdownTickMessage(message);
            break;

        case MSG.GAME_START:
            handleGameStartMessage(message);
            break;

        case MSG.POSITION_UPDATE:
            handlePositionUpdateMessage(message);
            break;

        case MSG.BOMB_PLACED:
            handleBombPlacedMessage(message);
            break;

        case MSG.EXPLOSION:
            handleExplosionMessage(message);
            break;

        case MSG.BLOCK_DESTROYED:
            handleBlockDestroyedMessage(message);
            break;

        case MSG.POWER_UP_SPAWNED:
            handlePowerUpSpawnedMessage(message);
            break;

        case MSG.POWER_UP_COLLECTED:
            handlePowerUpCollectedMessage(message);
            break;

        case MSG.PLAYER_HIT:
            handlePlayerHitMessage(message);
            break;

        case MSG.PLAYER_OUT:
            handlePlayerOutMessage(message);
            break;

        case MSG.GAME_OVER:
            handleGameOverMessage(message);
            break;

        default:
            console.warn(
                `Unhandled server message: ${message.type}`,
            );
    }
}

function handleJoinedMessage(message) {
    const player = message.player;

    if (!player) {
        console.warn(
            "Joined message did not contain a player.",
        );
        return;
    }

    gameStore.setState({
        playerId: player.id,
        nickname: player.nickname,
        nicknameInput: player.nickname,
        joinError: "",
    });
}

function handleJoinErrorMessage(message) {
    const errorMessage =
        typeof message.message === "string"
            ? message.message
            : "Unable to join the game.";

    gameStore.setState({
        joinError: errorMessage,
    });
}

function handlePlayerListMessage(message) {
    const players = Array.isArray(message.players)
        ? message.players
        : [];

    gameStore.setState({
        players,
    });
}

function handleChatMessage(message) {
    if (
        typeof message.text !== "string" ||
        typeof message.nickname !== "string"
    ) {
        console.warn(
            "Chat message contained invalid data.",
        );
        return;
    }

    const text = message.text.trim();

    if (text.length === 0) {
        return;
    }

    const state = gameStore.getState();

    const chatMessage = {
        playerId: message.playerId,
        nickname: message.nickname,
        text,
        sentAt:
            typeof message.sentAt === "number"
                ? message.sentAt
                : Date.now(),
    };

    gameStore.setState({
        chatMessages: [
            ...state.chatMessages,
            chatMessage,
        ],
    });
}
function handleCountdownTickMessage(message) {
    if (message.phase === "cancelled") {
        gameStore.setState({
            waitSecondsRemaining: null,
            countdownSecondsRemaining: null,
        });
        return;
    }

    if (message.phase === "waiting") {
        gameStore.setState({
            waitSecondsRemaining: message.secondsRemaining,
            countdownSecondsRemaining: null,
        });
        return;
    }

    if (message.phase === "starting") {
        gameStore.setState({
            waitSecondsRemaining: null,
            countdownSecondsRemaining: message.secondsRemaining,
        });
    }
}

function handleGameStartMessage(message) {
    // this broadcast reaches every open tab, including ones still
    // sitting on the nickname screen that never actually joined - only
    // switch this client to the game screen if it's actually a player
    // in this match, not just a connected socket.
    const currentPlayerId = gameStore.getState().playerId;

    if (!currentPlayerId) {
        return;
    }

    gameStore.setState({
        phase: GAME_PHASE.PLAYING,
        waitSecondsRemaining: null,
        countdownSecondsRemaining: null,
        map: message.map,
        players: Array.isArray(message.players)
            ? message.players
            : [],
    });

    startGameLoop(() => {
        const current = gameStore.getState();
        return current.players.find(
            (player) => player.id === current.playerId,
        ) || null;
    });
}

function handlePositionUpdateMessage(message) {
    const state = gameStore.getState();

    // find the player in the array and update their position
    const updatedPlayers = state.players.map((player) => {
        if (player.id === message.playerId) {
            return { ...player, position: message.position };
        }
        return player;
    });

    gameStore.setState({ players: updatedPlayers });
}

function handleBombPlacedMessage(message) {
    const bomb = message.bomb;

    if (
        !bomb ||
        typeof bomb.id !== "string" ||
        !bomb.position
    ) {
        console.warn(
            "Bomb placed message did not contain a valid bomb.",
        );
        return;
    }

    const state = gameStore.getState();

    const bombAlreadyExists = state.bombs.some(
        (existingBomb) =>
            existingBomb.id === bomb.id,
    );

    if (bombAlreadyExists) {
        return;
    }

    gameStore.setState({
        bombs: [
            ...state.bombs,
            bomb,
        ],
    });
}

 function handleExplosionMessage(message) {
    const explosion = message.explosion;

    if (
        !explosion ||
        typeof explosion.id !== "string" ||
        typeof explosion.bombId !== "string" ||
        !Array.isArray(explosion.tiles)
    ) {
        console.warn(
            "Explosion message did not contain a valid explosion.",
        );
        return;
    }

    const state = gameStore.getState();

    const remainingBombs = state.bombs.filter(
        (bomb) => bomb.id !== explosion.bombId,
    );

    const explosionAlreadyExists =
        state.explosions.some(
            (activeExplosion) =>
                activeExplosion.id === explosion.id,
        );

    if (explosionAlreadyExists) {
        return;
    }

    gameStore.setState({
        bombs: remainingBombs,
        explosions: [
            ...state.explosions,
            explosion,
        ],
    });

    removeExplosionAfterDuration(explosion);
}

function removeExplosionAfterDuration(explosion) {
    const duration =
        typeof explosion.durationMs === "number"
            ? explosion.durationMs
            : GAME_RULES.EXPLOSION_DURATION_MS;

    const startTime = performance.now();

    function checkTime(currentTime) {
        if (currentTime - startTime < duration) {
            requestAnimationFrame(checkTime);
            return;
        }

        const state = gameStore.getState();

        gameStore.setState({
            explosions: state.explosions.filter(
                (activeExplosion) =>
                    activeExplosion.id !== explosion.id,
            ),
        });
    }

    requestAnimationFrame(checkTime);
}

function handleBlockDestroyedMessage(message) {
    const position = message.position;
    const state = gameStore.getState();

    if (
        !position ||
        !state.map ||
        !Array.isArray(state.map.tiles)
    ) {
        console.warn(
            "Block destroyed message contained invalid data.",
        );
        return;
    }

    const row = position.row;
    const col = position.col;

    if (!state.map.tiles[row]?.[col]) {
        return;
    }

    const updatedTiles = state.map.tiles.map(
        (tileRow) => [...tileRow],
    );

    updatedTiles[row][col] = TILE_TYPE.EMPTY;

    gameStore.setState({
        map: {
            ...state.map,
            tiles: updatedTiles,
        },
    });
}

function handlePowerUpSpawnedMessage(message) {
    const state = gameStore.getState();

    gameStore.setState({
        powerUps: [
            ...state.powerUps,
            { position: message.position, type: message.powerUpType },
        ],
    });
}

function handlePowerUpCollectedMessage(message) {
    const state = gameStore.getState();

    gameStore.setState({
        powerUps: state.powerUps.filter(
            (powerUp) =>
                !(
                    powerUp.position.row === message.position.row &&
                    powerUp.position.col === message.position.col
                ),
        ),
    });

    updatePlayer(message.playerId, {
        maxBombs: message.maxBombs,
        flameRange: message.flameRange,
        speedLevel: message.speedLevel,
    });
}

function handlePlayerHitMessage(message) {
    updatePlayer(message.playerId, {
        lives: message.livesRemaining,
    });

    flashPlayerHit(message.playerId);
}

// briefly marks a player as "just hit" so the board can show a blink
// animation, then clears the flag once the animation has had time to
// play - this mirrors the same pattern already used for explosions
// (removeExplosionAfterDuration), just for a shorter duration.
function flashPlayerHit(playerId) {
    const state = gameStore.getState();

    gameStore.setState({
        hitPlayerIds: [...state.hitPlayerIds, playerId],
    });

    const startTime = performance.now();
    const duration = 2000;

    function checkTime(currentTime) {
        if (currentTime - startTime < duration) {
            requestAnimationFrame(checkTime);
            return;
        }

        const current = gameStore.getState();

        gameStore.setState({
            hitPlayerIds: current.hitPlayerIds.filter(
                (id) => id !== playerId,
            ),
        });
    }

    requestAnimationFrame(checkTime);
}

function handlePlayerOutMessage(message) {
    updatePlayer(message.playerId, {
        lives: 0,
        isOut: true,
    });
}

function updatePlayer(playerId, changes) {
    const state = gameStore.getState();

    const updatedPlayers = state.players.map((player) =>
        player.id === playerId
            ? { ...player, ...changes }
            : player,
    );

    gameStore.setState({ players: updatedPlayers });
}

function handleGameOverMessage(message) {
    const currentPlayerId = gameStore.getState().playerId;

    if (!currentPlayerId) {
        return;
    }

    gameStore.setState({
        phase: GAME_PHASE.GAME_OVER,
        winnerId: message.winnerId,
        winnerNickname: message.winnerNickname,
        winReason: message.reason,
    });

    stopGameLoop();
}