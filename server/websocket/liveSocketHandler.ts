import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { LiveBridgeSession } from "../services/geminiLiveService";

export function setupLiveWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", (ws: WebSocket) => {
    const session = new LiveBridgeSession(ws);

    ws.on("message", (data) => {
      session.handleClientMessage(data.toString());
    });

    ws.on("close", () => {
      session.close();
    });

    ws.on("error", (err) => {
      console.warn("[LiveWebSocket] Client error:", err.message);
      session.close();
    });
  });

  return wss;
}
