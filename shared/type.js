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

    // not specified in requirements - documented team choice
    POWER_UP_DROP_CHANCE: 0.3,

    // movement pacing: each Speed power-up level shaves SPEED_STEP_MS off
    // the interval between moves the client is allowed to send, down to
    // MIN_MOVE_INTERVAL_MS as a floor.
    BASE_MOVE_INTERVAL_MS: 150,
    SPEED_STEP_MS: 25,
    MIN_MOVE_INTERVAL_MS: 60,
});