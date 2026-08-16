import { send } from "../../network/socket.js";
import { MSG } from "../../../shared/events.js";
import { GAME_RULES } from "../../../shared/type.js";
import { listenGlobal } from "../../framework/index.js";

// tracks which keys are currently held down
const keysHeld = {};

export function startInputListening() {
    listenGlobal(document, "focusin", (event) => {
        const isTyping =
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement;

        if (isTyping) {
            for (const key in keysHeld) {
                keysHeld[key] = false;
            }
        }
    });

    listenGlobal(document, "keydown", (event) => {
    const isTyping =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement;

    if (isTyping) {
        return;
    }

    const isGameKey =
        event.code === "Space" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "w" ||
        event.key === "a" ||
        event.key === "s" ||
        event.key === "d";

    if (isGameKey) {
        event.preventDefault();
    }

        if (event.code === "Space" && !event.repeat) {
            event.preventDefault();

            send({
                type: MSG.PLACE_BOMB,
            });

            return;
        }

        keysHeld[event.key] = true;
    });

    listenGlobal(document, "keyup", (event) => {
        keysHeld[event.key] = false;
    });
}

let lastMoveTime = 0;
let loopRunning = false;

// getPlayer must return the current player's own object (with .id and
// .speedLevel), not just an id - Speed power-ups only shorten the
// interval the client is allowed to send moves at, so we need the
// live speedLevel every frame, not just once at game-start.
export function startGameLoop(getPlayer) {
    if (loopRunning) return;
    loopRunning = true;

    function loop(timestamp) {
        if (!loopRunning) return;

        const player = getPlayer();
        const speedLevel = player?.speedLevel ?? 0;

        const moveInterval = Math.max(
            GAME_RULES.BASE_MOVE_INTERVAL_MS -
                speedLevel * GAME_RULES.SPEED_STEP_MS,
            GAME_RULES.MIN_MOVE_INTERVAL_MS,
        );

        const timeSinceLastMove = timestamp - lastMoveTime;

        if (timeSinceLastMove >= moveInterval) {
            const direction = getDirectionFromKeys();

            if (direction && player) {
                send({
                    type: MSG.MOVE,
                    playerId: player.id,
                    direction,
                });

                lastMoveTime = timestamp;
            }
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

export function stopGameLoop() {
    loopRunning = false;
}

function getDirectionFromKeys() {
    if (keysHeld["ArrowUp"]    || keysHeld["w"]) return "up";
    if (keysHeld["ArrowDown"]  || keysHeld["s"]) return "down";
    if (keysHeld["ArrowLeft"]  || keysHeld["a"]) return "left";
    if (keysHeld["ArrowRight"] || keysHeld["d"]) return "right";
    return null;
}