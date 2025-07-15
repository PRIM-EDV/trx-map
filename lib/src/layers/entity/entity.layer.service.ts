import { Injectable } from "@angular/core";

import { MapService } from "../../core/map.service";
import { Entity, EntityType } from "../../core/models/entity";
import { ICON_PATHS } from "./config/icon.config";
import { loadImage } from "../common/utils/image";
import { assets } from '../../../assets/assets';

@Injectable()
export class EntityLayerService {

  private unitIcons: HTMLImageElement[] = [];
  private enemyIcons: HTMLImageElement[] = [];
  private objectIcons: HTMLImageElement[] = [];

  constructor(
    private readonly map: MapService
  ) {
    this.loadIcons();
  }

  public drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + entity.position.x * scale.x * zoom;
    const y = offset.y + entity.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;

    switch(true) {
      case entity.type === EntityType.FOE:
        ctx.drawImage(this.enemyIcons[entity.size], x, y, 32 * factor, 32 * factor); 
        break;
      case entity.type === EntityType.FRIEND:
        ctx.drawImage(this.unitIcons[entity.size], x, y, 32 * factor, 32 * factor);
        this.drawOutlinedText(ctx, entity.text, x, y, factor); 
        break
      case entity.type === EntityType.OBJECT:
        ctx.drawImage(this.objectIcons[entity.size], x, y, 32 * factor, 32 * factor);
        this.drawOutlinedText(ctx, entity.text, x, y, factor);
        break;
    }
  }
  
  private drawOutlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, factor: number) {
    ctx.textAlign = 'center';

    ctx.font = '11px Fira Code';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y + 12 + 24 * factor);

    ctx.font = '11px Fira Code';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.fillText(text, x, y + 12 + 24 * factor);
  }

  private async loadIcons() {
    this.unitIcons = await Promise.all(
      ICON_PATHS.units.map((path) => loadImage(assets[path]))
    );
    this.enemyIcons = await Promise.all(
      ICON_PATHS.enemies.map((path) => loadImage(assets[path]))
    );
    this.objectIcons = await Promise.all(
      ICON_PATHS.objects.map((path) => loadImage(assets[path]))
    );
  }
}