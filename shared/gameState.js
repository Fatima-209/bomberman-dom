//all possible stages of the game
export const GAME_PHASE = Object.freeze({
    LOBBY: "lobby",
    COUNTDOWN: "countdown",
    PLAYING: "playing",
    GAME_OVER: "game-over",
});
//all relavent fields for each player on initialization 
export function createPlayer(playerId, nickname) {
    return {
        id: playerId,
        nickname,
        connected: true,

        lives: 3,
        isOut: false,

        position: null,

        maxBombs: 1,
        activeBombs: 0,
        flameRange: 1,
        speedLevel: 0,
    };
}
//what every game state should look like 
export function createInitialGameState() {
    return {
        phase: GAME_PHASE.LOBBY,

        players: {},

        map: null,

        bombs: [],

        powerUps: [],

        lobby: {
            waitSecondsRemaining: null,
            countdownSecondsRemaining: null,
        },

        winnerId: null,
    };
}