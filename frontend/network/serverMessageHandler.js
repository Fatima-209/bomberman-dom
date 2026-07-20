import { MSG } from "../../shared/events.js";
import { GAME_PHASE } from "../../shared/gameState.js";
import { gameStore } from "../state/gameStore.js";
import { startGameLoop } from "../app/game/inputHandler.js";

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