export const TILE_TYPE = Object.freeze({
    EMPTY: "empty",
    WALL: "wall",
    BLOCK: "block",
});

export const DIRECTION = Object.freeze({
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
});

export const POWER_UP_TYPE = Object.freeze({
    BOMBS: "bombs",
    FLAMES: "flames",
    SPEED: "speed",
});

export const GAME_RULES = Object.freeze({
    MAX_PLAYERS: 4,
    MAX_NICKNAME_LENGTH: 16,
    STARTING_LIVES: 3,
    STARTING_MAX_BOMBS: 1,
    STARTING_FLAME_RANGE: 1,
    LOBBY_WAIT_SECONDS: 20,
    COUNTDOWN_SECONDS: 10,
    MAP_ROWS: 11,
    MAP_COLS: 13,
        BOMB_FUSE_MS: 3000,
    EXPLOSION_DURATION_MS: 600,
});