import {
  Action,
  AppearDisappearEvent,
  BaseAction,
  EventCoordinates,
  KeyEvent,
} from "@stream-deck-for-node/sdk";
const hri = require("human-readable-ids").hri;
import { Request, Response } from "express";
import { app, sd, wssBroadcast } from "../index";
import { svgToBase64 } from "../tools";
import { defaultIcon } from "../icons";

// Device id: e.device

interface ActionSettingsHAButton {
  uuid?: string;
  device?: string;
  position?: { x: number; y: number };
  svg?: string;
}

@Action("ha-button")
export class HAButton extends BaseAction {
  // Init button specific settings
  async initButton(
    context: string,
    coordinates: EventCoordinates,
    btnDevice: string
  ) {
    var { uuid, device, position, svg } =
      await sd.getSettings<ActionSettingsHAButton>(context);

    // Generate button uuid if not available
    if (!uuid) {
      uuid = hri.random();
    }

    if (!device) {
      device = btnDevice;
    }

    // Update position of button on stream deck
    position = { x: coordinates.column, y: coordinates.row };

    // Use default svg if not configured
    if (!svg) {
      svg = defaultIcon;
    }

    // Save settings
    sd.setSettings<ActionSettingsHAButton>(context, {
      uuid: uuid,
      device: device,
      position: position,
      svg: svg,
    });

    // Add routes to webserver
    app.get("/sd/icon/" + uuid, async (req: Request, res: Response) => {
      var { svg } = await sd.getSettings<ActionSettingsHAButton>(context);
      res.writeHead(200, { "Content-Type": "image/svg+xml" });
      res.write(svg);
      res.end();
    });
    app.post("/sd/icon/" + uuid, async (req: Request, res: Response) => {
      var { uuid, device, position, svg } =
        await sd.getSettings<ActionSettingsHAButton>(context);

      // Check body
      if (!req.body) {
        res.status(422).send("No data in request");
        return;
      }
      if (!(req.body as string).startsWith("<svg")) {
        res.status(422).send("Only svgs are supported");
        return;
      }

      svg = req.body;
      sd.setImage(context, svgToBase64(svg as string));

      sd.setSettings<ActionSettingsHAButton>(context, {
        uuid: uuid,
        device: device,
        position: position,
        svg: svg,
      });

      res.status(200).send("Icon changed");
    });

    sd.setImage(context, svgToBase64(svg));

    wssBroadcast({ event: "appear", args: uuid });

    sd.showOk(context);
  }

  onAppear(e: AppearDisappearEvent) {
    this.initButton(e.context, e.payload.coordinates, e.device);
  }

  async onKeyDown(e: KeyEvent) {
    const { uuid } = await sd.getSettings<ActionSettingsHAButton>(e.context);
    wssBroadcast({ event: "keyDown", args: uuid });
  }

  async onKeyUp(e: KeyEvent) {
    const { uuid } = await sd.getSettings<ActionSettingsHAButton>(e.context);
    wssBroadcast({ event: "keyUp", args: uuid });
  }

  async onSingleTap(e: KeyEvent) {
    const { uuid } = await sd.getSettings<ActionSettingsHAButton>(e.context);
    wssBroadcast({ event: "singleTap", args: uuid });
  }

  async onDoubleTap(e: KeyEvent) {
    const { uuid } = await sd.getSettings<ActionSettingsHAButton>(e.context);
    wssBroadcast({ event: "doubleTap", args: uuid });
  }

  async onLongPress(e: KeyEvent) {
    const { uuid } = await sd.getSettings<ActionSettingsHAButton>(e.context);
    wssBroadcast({ event: "longPress", args: uuid });
  }
}
