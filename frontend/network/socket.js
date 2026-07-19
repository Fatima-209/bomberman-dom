let socket = null;

export function connect(serverUrl) {
    socket = new WebSocket(serverUrl);

    socket.onopen = () => {
        console.log("connected to server");
    };

    socket.onclose = (event) => {
        console.log("disconnected:", event.code, event.reason);
    };

    socket.onerror = (error) => {
        console.error("socket error:", error);
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("received:", message);
    };

    return socket;
}

export function send(message) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error("tried to send before connection was open:", message);
        return;
    }

    socket.send(JSON.stringify(message));
}