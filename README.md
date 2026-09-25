# Bomberman DOM

A real-time multiplayer Bomberman game built with vanilla JavaScript, WebSockets, and a custom DOM rendering framework. Join a shared lobby, chat while you wait, then navigate a generated arena and place bombs to outlast your opponents.

## Game visuals

### Arena background

![Bomberman game background artwork](Styles/public/game-background.png)

### In-game action

![Animated bomb explosion](Styles/public/explosion.gif)

### Power-ups

| Extra bombs | Longer flames | Faster movement |
|:--:|:--:|:--:|
| ![Bomb power-up](Styles/public/powerup-bombs.png) | ![Flame power-up](Styles/public/powerup-flames.png) | ![Speed power-up](Styles/public/powerup-speed.png) |

## Features

- Real-time multiplayer gameplay over WebSockets
- Waiting room with player list, countdown, and chat
- Procedurally generated arenas
- Bombs, destructible blocks, and collectible power-ups
- A stained-glass inspired visual theme

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```bash
git clone <repository-url>
cd bomberman-dom
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The server hosts the game over HTTP on port `3000` and its WebSocket connection on port `8080`. To play with others, make the server reachable to them and ensure both ports are accessible.

For development, run `npm run dev`.

## How to play

1. Enter a nickname and select **Join Game**.
2. Wait for at least one other player. The game starts after the lobby timer or when the lobby fills.
3. Move with **WASD** or the **arrow keys**.
4. Press **Space** to place a bomb.
5. Avoid blasts and collect power-ups to gain an advantage.

## Project layout

```text
backend/    HTTP, WebSocket, lobby, map, and game handlers
frontend/   Game UI, input, state, and networking
shared/     Shared game state, events, and rules
Styles/     Stylesheets, sprites, and visual assets
```

## Tech stack

- JavaScript (ES modules)
- Node.js and `ws`
- Browser DOM and CSS


