import { Injectable } from "@angular/core";

import { MapService } from "../../core/map.service";
import { Entity, EntityType } from "../../core/models/entity";
import { ICON_PATHS, ICON_SIZE } from "./config/icon.config";
import { loadImage } from "../common/utils/image";
import { assets } from '../../../assets/assets';

@Injectable()
export class EntityLayerService {

  private unitIcons: HTMLImageElement[] = [];
  private enemyIcons: HTMLImageElement[] = [];
  private objectIcons: HTMLImageElement[] = [];
  private baseIcons: HTMLImageElement[] = [];
  private symbols: HTMLImageElement[] = [];

  constructor(
    private readonly map: MapService
  ) {
    this.loadIcons();
  }

  /**
   * Draws an entity on the canvas.
   * @param ctx The canvas rendering context.
   * @param entity The entity to draw.
   */
  public drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + entity.position.x * scale.x * zoom;
    const y = offset.y + entity.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;
    const size = ICON_SIZE * factor;
    const halfSize = size / 2;

    switch(true) {
      case entity.type === EntityType.FOE:
        ctx.drawImage(this.enemyIcons[entity.size], x - halfSize, y - halfSize, size, size); 
        break;
      case entity.type === EntityType.FRIEND:
        ctx.drawImage(this.unitIcons[entity.size], x - halfSize, y - halfSize, size, size);
        this.drawOutlinedText(ctx, entity.text, x, y + halfSize + 11); 
        break
      case entity.type === EntityType.OBJECT:
        ctx.drawImage(this.objectIcons[entity.size], x - halfSize, y - halfSize, size, size);
        this.drawOutlinedText(ctx, entity.text, x, y + halfSize + 11);
        break;
    }
  }

  /**
   * Draws a ping animation for an entity on the canvas.
   * @param ctx The canvas rendering context.
   * @param entity The entity to draw.
   * @param progress The progress of the animation (0 to 1).
   */
  public drawEntityPing(ctx: CanvasRenderingContext2D, entity: Entity, progress: number) {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + entity.position.x * scale.x * zoom;
    const y = offset.y + entity.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;
    const radius = ICON_SIZE * factor;
    ctx.beginPath();
    ctx.arc(x, y, progress * radius, 0, Math.PI * 2, false);
    ctx.fillStyle = `rgba(255, 0, 0, ${1 - progress})`;
    ctx.fill();
    ctx.closePath();
  }

  /**
   * Draws the symbol of an entity on the canvas.
   * @param ctx The canvas rendering context.
   * @param entity The entity whose symbol to draw.
   * @param opacity The opacity of the symbol.
   */
  public drawEntitySymbol(ctx: CanvasRenderingContext2D, entity: Entity, opacity: number) {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + entity.position.x * scale.x * zoom;
    const y = offset.y + entity.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;
    const size = ICON_SIZE * factor;
    const halfSize = size / 2;
    
    if(entity && entity.symbol && entity.symbol >= 0) {
      ctx.globalAlpha = opacity;
      ctx.drawImage(this.baseIcons[0], x - halfSize, y - halfSize, size, size);
      ctx.drawImage(this.symbols[entity.symbol], x - halfSize, y - halfSize + 2, size, size);
    }
  }
  
  private drawOutlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    ctx.textAlign = 'center';

    ctx.font = '11px Fira Code';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);

    ctx.font = '11px Fira Code';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.fillText(text, x, y);
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
    this.baseIcons = await Promise.all(
      ICON_PATHS.base.map((path) => loadImage(assets[path]))
    );
    this.symbols = await Promise.all(
      ICON_PATHS.symbols.map((path) => loadImage(assets[path]))
    );
  }
}