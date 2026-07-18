const { WebSocketServer } = require("ws");

const ALLOWED_ORIGINS = ["http://localhost:5050"];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, request) => {
  const origin = request.headers.origin;
  if (!ALLOWED_ORIGINS.includes(origin)) {
    ws.close(1008, "Origin not allowed");
    return;
  }

  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data);
    } catch {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    broadcast(wss, ws, message);
  });

  ws.on("error", (err) => console.error("Client error:", err.message));
});

function broadcast(server, sender, message) {
  const payload = JSON.stringify(message);
  for (const client of server.clients) {
    if (client !== sender && client.readyState === 1) {
      client.send(payload);
    }
  }
}

//pingpong detection
const interval = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

process.on("SIGTERM", () => {
  clearInterval(interval);
  for (const ws of wss.clients) {
    ws.close(1001, "Server shutting down");
  }
  wss.close(() => process.exit(0));
});