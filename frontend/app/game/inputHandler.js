import { send } from "../../network/socket.js";
import { MSG } from "../../../shared/events.js";

// tracks which keys are currently held down
const keysHeld = {};

export function startInputListening() {
    document.addEventListener("keydown", (event) => {
        keysHeld[event.key] = true;
    });

    document.addEventListener("keyup", (event) => {
        keysHeld[event.key] = false;
    });
}

// how many milliseconds between each move being sent to the server
const MOVE_INTERVAL_MS = 150;

let lastMoveTime = 0;
let loopRunning = false;

export function startGameLoop(getPlayerId) {
    if (loopRunning) return;
    loopRunning = true;

    function loop(timestamp) {
        if (!loopRunning) return;

        const timeSinceLastMove = timestamp - lastMoveTime;

        if (timeSinceLastMove >= MOVE_INTERVAL_MS) {
            const direction = getDirectionFromKeys();

            if (direction) {
                send({
                    type: MSG.MOVE,
                    playerId: getPlayerId(),
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