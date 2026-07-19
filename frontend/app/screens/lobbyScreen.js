import { createElement } from "../../framework/index.js";
import { GAME_RULES } from "../../../shared/type.js";

export function createLobbyScreen(state) {
    return createElement(
        "main",
        {
            className: "lobby-screen",
        },

        createElement(
            "section",
            {
                className: "lobby-card",
            },

            createElement(
                "h1",
                {},
                "Waiting Room",
            ),

            createElement(
                "p",
                {},
                `You joined as ${state.nickname}.`,
            ),

            createElement(
                "p",
                {
                    className: "player-count",
                },
                `Players: ${state.players.length} / ${GAME_RULES.MAX_PLAYERS}`,
            ),

            createElement(
                "h2",
                {},
                "Players",
            ),

            createElement(
                "ul",
                {
                    className: "player-list",
                },

                state.players.map((player) =>
                    createElement(
                        "li",
                        {
                            className:
                                player.id === state.playerId
                                    ? "player-list-item current-player"
                                    : "player-list-item",
                        },

                        player.id === state.playerId
                            ? `${player.nickname} (You)`
                            : player.nickname,
                    ),
                ),
            ),

            createElement(
                "p",
                {
                    className: "lobby-message",
                },
                lobbyMessage(state),
            ),
        ),
    );
}

function lobbyMessage(state) {
    if (state.countdownSecondsRemaining !== null) {
        return `Game starting in ${state.countdownSecondsRemaining}...`;
    }

    if (state.waitSecondsRemaining !== null) {
        return (
            `Starting in ${state.waitSecondsRemaining}s ` +
            "unless more players join sooner..."
        );
    }

    return state.players.length < 2
        ? "Waiting for at least one more player..."
        : "Enough players have joined. The game will begin soon.";
}