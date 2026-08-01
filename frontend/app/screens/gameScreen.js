import { createElement } from "../../framework/index.js";
import { createChatPanel } from "./chatPanel.js";
import { TILE_TYPE, GAME_RULES } from "../../../shared/type.js";


export function createGameScreen(state) {
    if (!state.map) {
        return createElement("main", { className: "game-screen" },
            createElement("p", {}, "Loading..."),
        );
    }

    const currentPlayer = getCurrentPlayer(state);

    // the match is still running for everyone else, but this player is
    // out of lives - stop showing them the live board (no more
    // spectating) and give them a way back to the nickname screen
    // instead.
    if (currentPlayer?.isOut) {
        return createYouLostScreen();
    }

    return createElement(
    "main",
    { className: "game-screen" },

    createLivesHud(state),
    createFpsCounter(state),

    createElement(
        "div",
        { className: "game-layout" },

        createElement(
            "div",
            { className: "game-board" },
            ...createTiles(state),
        ),

        createChatPanel(state),
    ),
);
}

export function createGameOverScreen(state) {
    const didCurrentPlayerWin =
        state.winnerId !== null &&
        state.winnerId === state.playerId;

    const title = !state.winnerId
        ? "Game Over"
        : didCurrentPlayerWin
          ? "You Won!"
          : "Game Over";

    const message = !state.winnerId
        ? "No winner - draw."
        : didCurrentPlayerWin
          ? "Congratulations!"
          : `${state.winnerNickname} wins. You lost.`;

    return createElement(
        "main",
        { className: "game-screen" },
        createElement(
            "section",
            { className: "lobby-card leaded" },
            createElement("span", { className: "corner tl" }),
            createElement("span", { className: "corner tr" }),
            createElement("span", { className: "corner bl" }),
            createElement("span", { className: "corner br" }),
            createElement("h1", {}, title),
            createElement("div", { className: "ornament-divider" }),
            createElement("p", {}, message),
            createHomeButton(),
        ),
    );
}

// full-screen takeover shown the moment a player runs out of lives,
// while the match is still going for everyone else.
function createYouLostScreen() {
    return createElement(
        "main",
        { className: "game-screen" },
        createElement(
            "section",
            { className: "lobby-card leaded" },
            createElement("span", { className: "corner tl" }),
            createElement("span", { className: "corner tr" }),
            createElement("span", { className: "corner bl" }),
            createElement("span", { className: "corner br" }),
            createElement("h1", {}, "You Lost"),
            createElement("div", { className: "ornament-divider" }),
            createElement("p", {}, "Better luck next time."),
            createHomeButton(),
        ),
    );
}

function createHomeButton() {
    return createElement(
        "button",
        {
            className: "btn",
            type: "button",
            onClick: () => window.location.reload(),
        },
        "Return to Home",
    );
}

function getCurrentPlayer(state) {
    return state.players.find(
        (player) => player.id === state.playerId,
    ) || null;
}

function createLivesHud(state) {
    return createElement(
        "div",
        { className: "lives-hud" },
        ...state.players.map((player) =>
            createElement(
                "span",
                {
                    className: player.isOut
                        ? "lives-hud-item out"
                        : "lives-hud-item",
                },
                `${player.nickname}: ${Math.max(player.lives, 0)} ` +
                    `(bombs ${player.maxBombs ?? 1}, ` +
                    `flames ${player.flameRange ?? 1}, ` +
                    `speed ${player.speedLevel ?? 0})`,
            ),
        ),
    );
}

function createFpsCounter(state) {
    const fps = state.fps ?? 0;

    // color hints at a glance whether frames are actually dropping
    const statusClass =
        fps >= 55 ? "fps-good" :
        fps >= 30 ? "fps-warn" :
        "fps-bad";

    return createElement(
        "div",
        { className: `fps-counter ${statusClass}` },
        `${fps} FPS`,
    );
}

// function createChatPanel(state) {
//     const messages = Array.isArray(state.chatMessages)
//         ? state.chatMessages.slice(-50)
//         : [];

//     return createElement(
//         "section",
//         { className: "chat-panel" },

//         createElement(
//             "h2",
//             { className: "chat-title" },
//             "Game Chat",
//         ),

//         createElement(
//             "div",
//             { className: "chat-messages" },

//             messages.length === 0
//                 ? createElement(
//                       "p",
//                       { className: "chat-empty" },
//                       "No messages yet.",
//                   )
//                 : messages.map(createChatMessage),
//         ),

//         createElement(
//             "form",
//             {
//                 className: "chat-form",

//                 onSubmit: (event) => {
//                     event.preventDefault();

//                     const form = event.currentTarget;
//                     const input = form.elements.chatMessage;
//                     const text = input.value.trim();

//                     if (text.length === 0) {
//                         return;
//                     }

//                     sendChatMessage(text);
//                     input.value = "";
//                     input.focus();
//                 },
//             },

//             createElement(
//                 "input",
//                 {
//                     className: "chat-input",
//                     name: "chatMessage",
//                     type: "text",
//                     maxlength: 200,
//                     autocomplete: "off",
//                     placeholder: "Type a message...",
//                 },
//             ),

//             createElement(
//                 "button",
//                 {
//                     className: "chat-send-button",
//                     type: "submit",
//                 },
//                 "Send",
//             ),
//         ),
//     );
// }

// function createChatMessage(message) {
//     return createElement(
//         "p",
//         { className: "chat-message" },

//         createElement(
//             "strong",
//             { className: "chat-nickname" },
//             `${message.nickname}: `,
//         ),

//         createElement(
//             "span",
//             { className: "chat-text" },
//             message.text,
//         ),
//     );
// }

function createTiles(state) {
    const tiles = [];
    const playerPositionMap = buildPlayerPositionMap(state.players);
    const bombPositionMap = buildBombPositionMap(state.bombs);
    const explosionPositionMap = buildExplosionPositionMap(state.explosions);
    const powerUpPositionMap = buildPowerUpPositionMap(state.powerUps);
    const hitPlayerIdSet = new Set(state.hitPlayerIds || []);

    for (let row = 0; row < GAME_RULES.MAP_ROWS; row++) {
        for (let col = 0; col < GAME_RULES.MAP_COLS; col++) {
            const tileType = state.map.tiles[row][col];
            const positionKey = row + "," + col;
            const playerIndex = playerPositionMap[positionKey];
            const bomb = bombPositionMap[positionKey];
            const hasExplosion = explosionPositionMap[positionKey] === true;
            const powerUp = powerUpPositionMap[positionKey];

            const isPlayerHit =
                playerIndex !== undefined &&
                hitPlayerIdSet.has(state.players[playerIndex]?.id);

            tiles.push(
                createTile(
                    tileType,
                    row,
                    col,
                    playerIndex,
                    bomb,
                    hasExplosion,
                    powerUp,
                    isPlayerHit,
                ),
            );
        }
    }

    return tiles;
}

function createTile(
    tileType,
    row,
    col,
    playerIndex,
    bomb,
    hasExplosion,
    powerUp,
    isPlayerHit,
) {
    const children = [];

    if (powerUp) {
        children.push(
            createElement(
                "div",
                {
                    className: "power-up power-up-" + powerUp.type,
                    style:
                        "background-image: url('../Styles/public/" +
                        POWER_UP_IMAGES[powerUp.type] +
                        "')",
                },
            ),
        );
    }
    if (bomb) {
        children.push(
            createElement(
                "div",
                {
                    className: "bomb",
                    "data-bomb-id": bomb.id,
                },
            ),
        );
    }
    if (hasExplosion) {
        children.push(
            createElement(
                "div",
                {
                    className: "explosion",
                },
            ),
        );
    }
    // if a player is on this tile, add their image as a child
    if (playerIndex !== undefined) {
        children.push(
            createElement(
                "div",
                {
                    className:
                        "player player-" + (playerIndex + 1) +
                        (isPlayerHit ? " hit" : ""),
                    style: "background-image: url('../Styles/public/" + PLAYER_IMAGES[playerIndex] + "')",
                },
            ),
        );
    }

    return createElement(
        "div",
        {
            className: "tile " + getTileClass(tileType),
            "data-row": row,
            "data-col": col,
        },
        ...children,
    );
}

function getTileClass(tileType) {
    if (tileType === TILE_TYPE.WALL)  return "wall";
    if (tileType === TILE_TYPE.BLOCK) return "block";
    return "floor";
}

const PLAYER_IMAGES = [
    "player-one.png",
    "player-two.png",
    "player-three.png",
    "player-four.png",
];

const POWER_UP_IMAGES = {
    bombs: "powerup-bombs.png",
    flames: "powerup-flames.png",
    speed: "powerup-speed.png",
};

function buildPlayerPositionMap(players) {
    const map = {};

    players.forEach((player, index) => {
        if (player.position && player.connected && !player.isOut) {
            const key = player.position.row + "," + player.position.col;
            map[key] = index;
        }
    });

    return map;
}

function buildBombPositionMap(bombs = []) {
    const map = {};

    bombs.forEach((bomb) => {
        if (!bomb.position) {
            return;
        }

        const key =
            bomb.position.row +
            "," +
            bomb.position.col;

        map[key] = bomb;
    });

    return map;
}

function buildPowerUpPositionMap(powerUps = []) {
    const map = {};

    powerUps.forEach((powerUp) => {
        if (!powerUp.position) {
            return;
        }

        const key =
            powerUp.position.row +
            "," +
            powerUp.position.col;

        map[key] = powerUp;
    });

    return map;
}

function buildExplosionPositionMap(
    explosions = [],
) {
    const map = {};

    explosions.forEach((explosion) => {
        if (!Array.isArray(explosion.tiles)) {
            return;
        }

        explosion.tiles.forEach((position) => {
            const key =
                position.row +
                "," +
                position.col;

            map[key] = true;
        });
    });

    return map;
}