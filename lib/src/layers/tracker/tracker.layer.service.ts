import { Injectable } from "@angular/core";

import { MapService } from "../../core/map.service";
import { Tracker } from "../../core/models/tracker";
import { ICON_PATHS, ICON_SIZE } from "./config/icon.config";
import { loadImage } from "../../common/utils/image";

@Injectable()
export class TrackerLayerService {

  private trackerIcon: HTMLImageElement | null = null;

  constructor(
    private readonly map: MapService
  ) {
    this.loadIcons();
  }

  /**
   * Draws a tracker on the canvas.
   * @param ctx The canvas rendering context.
   * @param tracker The tracker to draw.
   */
  public drawTracker(ctx: CanvasRenderingContext2D, tracker: Tracker) {
    if (!this.trackerIcon) return;

    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + tracker.position.x * scale.x * zoom;
    const y = offset.y + tracker.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;
    const size =  ICON_SIZE * factor;
    const halfSize = size / 2;

    ctx.drawImage(this.trackerIcon, x - halfSize, y - halfSize, size, size);
  }

  private async loadIcons() {
    this.trackerIcon = await loadImage(ICON_PATHS.tracker);
  }
}
