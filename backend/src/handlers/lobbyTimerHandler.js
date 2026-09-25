import { GAME_PHASE } from "../../../shared/gameState.js";
import { GAME_RULES } from "../../../shared/type.js";
import { MSG } from "../../../shared/events.js";
import { broadcastToAll } from "../websocket/hub.js";
import { toPublicPlayer } from "./joingameHandler.js";
import { generateMap } from "../map/mapGenerator.js";

let waitInterval = null;
let countdownInterval = null;

// Call after a player has been added to state.players.
export function onPlayerJoined(state) {
    if (state.phase !== GAME_PHASE.LOBBY) {
        return;
    }

    const count = Object.keys(state.players).length;

    if (count >= GAME_RULES.MAX_PLAYERS) {
        startCountdown(state);
        return;
    }

    if (count >= 2 && !waitInterval) {
        startWaitTimer(state);
    }
}

// Call when a player is removed during the LOBBY/COUNTDOWN phase.
export function onPlayerLeft(state) {
    const count = Object.keys(state.players).length;

    if (count >= 2) {
        return;
    }

    const wasRunning = waitInterval || countdownInterval;

    clearWaitTimer();
    clearCountdownTimer();

    state.phase = GAME_PHASE.LOBBY;
    state.lobby.waitSecondsRemaining = null;
    state.lobby.countdownSecondsRemaining = null;

    if (wasRunning) {
        broadcastToAll({ type: MSG.COUNTDOWN_TICK, phase: "cancelled" });
    }
}

function startWaitTimer(state) {
    state.lobby.waitSecondsRemaining = GAME_RULES.LOBBY_WAIT_SECONDS;
    broadcastCountdownTick(state, "waiting");

    waitInterval = setInterval(() => {
        if (state.phase !== GAME_PHASE.LOBBY) {
            clearWaitTimer();
            return;
        }

        state.lobby.waitSecondsRemaining -= 1;

        if (state.lobby.waitSecondsRemaining <= 0) {
            clearWaitTimer();
            startCountdown(state);
            return;
        }

        broadcastCountdownTick(state, "waiting");
    }, 1000);
}

function startCountdown(state) {
    if (state.phase === GAME_PHASE.COUNTDOWN) {
        return;
    }

    clearWaitTimer();

    state.phase = GAME_PHASE.COUNTDOWN;
    state.lobby.waitSecondsRemaining = null;
    state.lobby.countdownSecondsRemaining = GAME_RULES.COUNTDOWN_SECONDS;
    broadcastCountdownTick(state, "starting");

    countdownInterval = setInterval(() => {
        state.lobby.countdownSecondsRemaining -= 1;

        if (state.lobby.countdownSecondsRemaining <= 0) {
            clearCountdownTimer();
            startGame(state);
            return;
        }

        broadcastCountdownTick(state, "starting");
    }, 1000);
}

function startGame(state) {
    state.phase = GAME_PHASE.PLAYING;
    state.lobby.countdownSecondsRemaining = null;

    state.map = generateMap();

    //give each player a spawnpoint
    const players = Object.values(state.players);

    players.forEach((player, index) =>{
        player.position = {
            row: state.map.spawnPoints[index].row,
            col: state.map.spawnPoints[index].col,
        }

    });

    broadcastToAll({
        type: MSG.GAME_START,
        map: state.map,
        players: Object.values(state.players).map(toPublicPlayer),
        startedAt: Date.now(),
    });
}

function broadcastCountdownTick(state, phase) {
    broadcastToAll({
        type: MSG.COUNTDOWN_TICK,
        phase,
        secondsRemaining:
            phase === "waiting"
                ? state.lobby.waitSecondsRemaining
                : state.lobby.countdownSecondsRemaining,
    });
}

function clearWaitTimer() {
    if (waitInterval) {
        clearInterval(waitInterval);
        waitInterval = null;
    }
}

function clearCountdownTimer() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}
