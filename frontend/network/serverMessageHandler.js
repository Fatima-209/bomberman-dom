import { MSG } from "../../shared/events.js";
import { gameStore } from "../state/gameStore.js";

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