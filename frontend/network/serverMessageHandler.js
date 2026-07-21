import { MSG } from "../../shared/events.js";
import { GAME_PHASE } from "../../shared/gameState.js";
import { gameStore } from "../state/gameStore.js";
import { startGameLoop } from "../app/game/inputHandler.js";
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
    gameStore.setState({
        phase: GAME_PHASE.PLAYING,
        waitSecondsRemaining: null,
        countdownSecondsRemaining: null,
        map: message.map,
        players: Array.isArray(message.players)
            ? message.players
            : [],
    });

    // start the game loop, passes a function so the loop always
    // reads the current playerId from state rather than a stale value
    startGameLoop(() => gameStore.getState().playerId);
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