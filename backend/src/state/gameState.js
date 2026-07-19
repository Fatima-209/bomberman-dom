import { createInitialGameState } from "../../../shared/gameState.js";

let gameState = createInitialGameState();

//creates and stores actual game state
export function getGameState() {
    return gameState;
}

export function resetGameState() {
    gameState = createInitialGameState();
    return gameState;
}