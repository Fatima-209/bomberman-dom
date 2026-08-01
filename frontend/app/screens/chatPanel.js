import { createElement } from "../../framework/index.js";
import { sendChatMessage } from "../../network/socket.js";

export function createChatPanel(state, title = "Game Chat") {
    const messages = Array.isArray(state.chatMessages)
        ? state.chatMessages.slice(-50)
        : [];

    return createElement(
        "section",
        { className: "chat-panel" },

        createElement(
            "h2",
            { className: "chat-title" },
            title,
        ),

        createElement(
            "div",
            { className: "chat-messages" },

            messages.length === 0
                ? createElement(
                      "p",
                      { className: "chat-empty" },
                      "No messages yet.",
                  )
                : messages.map(createChatMessage),
        ),

        createElement(
            "form",
            {
                className: "chat-form",

                onSubmit: (event) => {
                    event.preventDefault();

                    const form = event.currentTarget;
                    const input = form.elements.chatMessage;
                    const text = input.value.trim();

                    if (text.length === 0) {
                        return;
                    }

                    sendChatMessage(text);
                    input.value = "";
                    input.focus();
                },
            },

            createElement(
                "input",
                {
                    className: "chat-input",
                    name: "chatMessage",
                    type: "text",
                    maxlength: 200,
                    autocomplete: "off",
                    placeholder: "Type a message...",
                },
            ),

            createElement(
                "button",
                {
                    className: "chat-send-button",
                    type: "submit",
                },
                "Send",
            ),
        ),
    );
}

function createChatMessage(message) {
    return createElement(
        "p",
        { className: "chat-message" },

        createElement(
            "strong",
            { className: "chat-nickname" },
            `${message.nickname}: `,
        ),

        createElement(
            "span",
            { className: "chat-text" },
            message.text,
        ),
    );
}