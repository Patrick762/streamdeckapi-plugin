import "./actions/habutton";
import { StreamDeck } from "@stream-deck-for-node/sdk";
import { Server as ssdpServer } from "node-ssdp";
import express, { Express, Request, Response } from "express";
import * as http from "http";
import { WebSocket, WebSocketServer } from "ws";

export const SD_SSDP = "urn:home-assistant.io:device:stream-deck";

interface PluginSettings {}

export const sd = new StreamDeck<PluginSettings>();

// Enable discovery for Home Assistant Integration
const ssdp = new ssdpServer();
ssdp.addUSN(SD_SSDP);
ssdp.start();

// Start webserver
export const app: Express = express();
const server = http.createServer(app);
app.use(express.text({ type: "image/svg+xml" }));
app.get("/sd/info", (req: Request, res: Response) => {
  res.json({
    devices: sd.info.devices,
    application: sd.info.application,
    buttons: sd.settingsManager,
  });
});

// Start websocket server
export const wss = new WebSocketServer({ server });
wss.on("connection", (ws: WebSocket) => {
  // send immediately a feedback to the incoming connection
  ws.send(JSON.stringify({ event: "connected", args: {} }));

  Object.keys(sd.settingsManager).forEach((context) => {
    sd.showOk(context);
  });
});
server.listen(6153);

// Broadcast to all.
export function wssBroadcast(data: { event: string; args: any }) {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(data));
    client.emit(data.event, data.args);
  });
}

// Send status updates every 10 seconds
setInterval(() => {
  wssBroadcast({
    event: "status",
    args: {
      devices: sd.info.devices,
      application: sd.info.application,
      buttons: sd.settingsManager,
    },
  });
}, 10000);

setInterval(() => {
  if (wss.clients.size < 1) {
    Object.keys(sd.settingsManager).forEach((context) => {
      sd.showAlert(context);
    });
  }
}, 3000);
