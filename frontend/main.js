// import { connect } from "./network/socket.js";

// connect("ws://localhost:8080");

import {
    createElement,
    render,
    goToPath,
    startRouter,
} from "./framework/index.js";

import { connect } from "./network/socket.js";
import { gameStore } from "./state/gameStore.js";

const appContainer = document.getElementById("app");

if (!appContainer) {
    throw new Error('Element with id="app" was not found.');
}

let currentPath = "#/";

function createAppScreen(state) {
    const clickCount = state.testClickCount || 0;

    return createElement(
        "main",
        {},

        createElement(
            "h1",
            {},
            "Bomberman-DOM",
        ),

        createElement(
            "p",
            {},
            "Framework foundation test",
        ),

        createElement(
            "p",
            {},
            `Current route: ${currentPath}`,
        ),

        createElement(
            "p",
            {},
            `WebSocket status: ${state.connectionStatus}`,
        ),

        createElement(
            "p",
            {},
            `Button clicked: ${clickCount} times`,
        ),

        createElement(
            "button",
            {
                type: "button",

                onClick: () => {
                    gameStore.setState({
                        testClickCount: clickCount + 1,
                    });
                },
            },
            "Test framework event",
        ),

        createElement(
            "button",
            {
                type: "button",

                onClick: () => {
                    if (currentPath === "#/") {
                        goToPath("#/test");
                    } else {
                        goToPath("#/");
                    }
                },
            },
            "Change route",
        ),
    );
}

function renderApp() {
    const state = gameStore.getState();
    const screen = createAppScreen(state);

    render(screen, appContainer);
}

gameStore.subscribe(renderApp);

startRouter((path) => {
    currentPath = path;
    renderApp();
});

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