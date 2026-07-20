import { createElement } from "../../framework/index.js";
import { TILE_TYPE, GAME_RULES } from "../../../shared/type.js";

export function createGameScreen(state) {
    return createElement(
        "main",
        { className: "game-screen" },
        createElement(
            "div",
            { className: "game-board" },
            ...createTiles(state),
        ),
    );
}

function createTiles(state) {
    const tiles = [];
    const playerPositionMap = buildPlayerPositionMap(state.players);

    for (let row = 0; row < GAME_RULES.MAP_ROWS; row++) {
        for (let col = 0; col < GAME_RULES.MAP_COLS; col++) {
            const tileType = state.map.tiles[row][col];
            const playerIndex = playerPositionMap[row + "," + col];
            tiles.push(createTile(tileType, row, col, playerIndex));
        }
    }

    return tiles;
}

function createTile(tileType, row, col, playerIndex) {
    const children = [];

    // if a player is on this tile, add their image as a child
    if (playerIndex !== undefined) {
        children.push(
            createElement(
                "div",
                {
                    className: "player player-" + (playerIndex + 1),
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

function buildPlayerPositionMap(players) {
    const map = {};

    players.forEach((player, index) => {
        if (player.position) {
            const key = player.position.row + "," + player.position.col;
            map[key] = index;
        }
    });

    return map;
}