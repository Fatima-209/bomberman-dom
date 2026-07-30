import { render, update, createElement } from "./framework/index.js";
import { GAME_PHASE } from "../shared/gameState.js";

import { createNicknameScreen, MAX_NICKNAME_LENGTH } from "./app/screens/nameenterScreen.js";
import { createLobbyScreen } from "./app/screens/lobbyScreen.js";
import { createGameScreen, createGameOverScreen } from "./app/screens/gameScreen.js";

import { connect, send, onMessage } from "./network/socket.js";

import { handleServerMessage } from "./network/serverMessageHandler.js";

import { gameStore } from "./state/gameStore.js";
import { MSG } from "../shared/events.js";
import { startInputListening } from "./app/game/inputHandler.js";
import { startFpsCounter } from "./app/game/fpsCounter.js";

//TEMPORARY — for manually testing state changes from devtools console.
//remove this line before committing.
window.gameStore = gameStore;

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

//keep state insync with th elive text in the input, so that it doesn't disapear.
function handleNicknameInput(rawValue){
    gameStore.setState({
        nicknameInput: rawValue,
    });
}

//this tracks if we ran thw the first render or not, so we know which funxtion we use (render(), update())
let hasRenderedOnce = false;


//renders app and choose which screen to display
function renderApp() {
    const state = gameStore.getState();

    const screen =
    state.phase === GAME_PHASE.GAME_OVER
        ? createGameOverScreen(state)
        : state.phase === GAME_PHASE.PLAYING
          ? createGameScreen(state)
          : state.playerId
            ? createLobbyScreen(state)
            : createNicknameScreen(
                  state,
                  handleNicknameSubmit,
                  handleNicknameInput,
              );

              if (!hasRenderedOnce){
                render(screen, appContainer);
                hasRenderedOnce = true;
            }else{
                update(screen);
            }
}

startInputListening();
startFpsCounter();

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