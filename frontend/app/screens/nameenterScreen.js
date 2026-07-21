import { createElement } from "../../framework/index.js";
import { GAME_RULES } from "../../../shared/type.js";

export const MAX_NICKNAME_LENGTH =
    GAME_RULES.MAX_NICKNAME_LENGTH;

export function createNicknameScreen(state, onNicknameSubmit, onNicknameInput) {
    const isConnected =
        state.connectionStatus === "connected";

    return createElement(
        "main",
        {
            className: "nickname-screen",
        },

        createElement(
            "section",
            {
                className: "nickname-card leaded",
            },

            createElement("span", { className: "corner tl" }),
            createElement("span", { className: "corner tr" }),
            createElement("span", { className: "corner bl" }),
            createElement("span", { className: "corner br" }),

            createElement(
                "h1",
                {},
                "Bomberman",
            ),

            createElement("div", { className: "ornament-divider" }),

            createElement(
                "p",
                {},
                "Enter a nickname to join the game.",
            ),

            createElement(
                "form",
                {
                    onSubmit: (event) => {
                        //prevents reloading of the page
                        event.preventDefault();

                        const form = event.currentTarget;
                        const input = form.elements.nickname;

                        onNicknameSubmit(input.value);
                    },
                },

                createElement(
                    "label",
                    {
                        for: "nickname-input",
                    },
                    "Nickname",
                ),

                createElement(
                    "input",
                    {
                        id: "nickname-input",
                        name: "nickname",
                        type: "text",
                        value: state.nicknameInput,
                        oninput: (event) => {
                            onNicknameInput(event.target.value);
                        },
                        maxlength: MAX_NICKNAME_LENGTH,
                        autocomplete: "off",
                        placeholder: "Enter your nickname",
                        disabled: !isConnected,
                    },
                ),
// any error in nickname entry, nickname already in use, nickname empty or lobby full  
                state.joinError
                    ? createElement(
                          "p",
                          {
                              className: "nickname-error",
                          },
                          state.joinError,
                      )
                    : null,

                createElement(
                    "button",
                    {
                        type: "submit",
                        disabled: !isConnected,
                        //when connected input button is disabled
                    },
                    isConnected
                        ? "Join Game"
                        : "Connecting...",
                ),
            ),
        ),
    );
}