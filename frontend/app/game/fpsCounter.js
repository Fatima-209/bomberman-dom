import { gameStore } from "../../state/gameStore.js";

// counts how many animation frames actually happened, and how long since we last reported a number
let frameCount = 0;
let windowStartTime = 0;
let running = false;

export function startFpsCounter() {
    if (running) return;
    running = true;

    function loop(timestamp) {
        if (!running) return;

        frameCount++;

        if (windowStartTime === 0) {
            windowStartTime = timestamp;
        }

        const elapsed = timestamp - windowStartTime;

        // report once per second, using the real frame count from that
        // second - if frames were dropped, this number goes below 60
        // on its own, we never set it directly
        if (elapsed >= 1000) {
            const fps = Math.round((frameCount * 1000) / elapsed);

            gameStore.setState({ fps });

            frameCount = 0;
            windowStartTime = timestamp;
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}