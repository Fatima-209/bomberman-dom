const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  console.log("Connected");
  ws.send(JSON.stringify({ type: "hello" }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = (event) => {
  console.log(`Closed: ${event.code} ${event.reason}`);
};