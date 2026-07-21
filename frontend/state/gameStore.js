import { createStore } from "../framework/store.js";
import { GAME_PHASE } from "../../shared/gameState.js";
//front end for the game
const initialState = {
    connectionStatus: "disconnected",

    phase: GAME_PHASE.LOBBY,

    playerId: null,
    nickname: "",
    nicknameInput: "",
    joinError: "",

    players: [],

    waitSecondsRemaining: null,
    countdownSecondsRemaining: null,

  map: null,
bombs: [],
explosions: [],
    powerUps: [],

    chatMessages: [],

    winnerId: null,
};

export const gameStore = createStore(initialState);