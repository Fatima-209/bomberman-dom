import { render } from "./framework/index.js";

import {
    createNicknameScreen,
    MAX_NICKNAME_LENGTH,
} from "./app/screens/nameenterScreen.js";

import { createLobbyScreen } from "./app/screens/lobbyScreen.js";

import {
    connect,
    send,
    onMessage,
} from "./network/socket.js";

import {
    handleServerMessage,
} from "./network/serverMessageHandler.js";

import { gameStore } from "./state/gameStore.js";
import { MSG } from "../shared/events.js";

const appContainer = document.getElementById("app");

if (!appContainer) {
    throw new Error(
        'Element with id="app" was not found.',
    );
}
//cleans up and validates nickname
function handleNicknameSubmit(rawNickname) {
    const nickname = rawNickname.trim();

    if (nickname.length === 0) {
        gameStore.setState({
            nicknameInput: rawNickname,
            joinError: "Please enter a nickname.",
        });

        return;
    }

    if (nickname.length > MAX_NICKNAME_LENGTH) {
        gameStore.setState({
            nicknameInput: rawNickname,
            joinError:
                `Nickname must be ${MAX_NICKNAME_LENGTH} ` +
                "characters or fewer.",
        });

        return;
    }

    gameStore.setState({
        nicknameInput: nickname,
        joinError: "",
    });

    send({
        type: MSG.JOIN,
        nickname,
    });
}
//renders app and choose which screen to display
function renderApp() {
    const state = gameStore.getState();

    const screen = state.playerId
        ? createLobbyScreen(state)
        : createNicknameScreen(
              state,
              handleNicknameSubmit,
          );

    render(screen, appContainer);
}

gameStore.subscribe(renderApp);

onMessage(handleServerMessage);

gameStore.setState({
    connectionStatus: "connecting",
});

const socket = connect("ws://localhost:8080");

socket.addEventListener("open", () => {
    gameStore.setState({
        connectionStatus: "connected",
    });
});

socket.addEventListener("close", () => {
    gameStore.setState({
        connectionStatus: "disconnected",
    });
});