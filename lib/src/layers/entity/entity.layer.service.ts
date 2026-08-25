import { Injectable } from "@angular/core";

import { MapService } from "../../core/map.service";
import { Entity, EntityType } from "../../core/models/entity";
import { ICON_PATHS, ICON_SIZE } from "./config/icon.config";
import { loadImage } from "../../common/utils/image";

@Injectable()
export class EntityLayerService {

  private selfIcon: HTMLImageElement | null = null;
  private unitIcons: HTMLImageElement[] = Array.from({ length: ICON_PATHS.units.length }, () => new Image());
  private enemyIcons: HTMLImageElement[] = Array.from({ length: ICON_PATHS.enemies.length }, () => new Image());
  private objectIcons: HTMLImageElement[] = Array.from({ length: ICON_PATHS.objects.length }, () => new Image());
  private baseIcons: HTMLImageElement[] = Array.from({ length: ICON_PATHS.base.length }, () => new Image());
  private symbols: HTMLImageElement[] = Array.from({ length: ICON_PATHS.symbols.length }, () => new Image());

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
  public async drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const x = offset.x + entity.position.x * scale.x * zoom;
    const y = offset.y + entity.position.y * scale.y * zoom;

    const factor = Math.min(0.5, zoom) * 2;
    const size = ICON_SIZE * factor;
    const halfSize = size / 2;
    switch (true) {
      case entity.type === EntityType.FOE:
        const enemyIcon = await this.getIcon(this.enemyIcons, entity.size);
        ctx.drawImage(enemyIcon, x - halfSize, y - halfSize, size, size);
        break;
      case entity.type === EntityType.FRIEND:
        const unitIcon = await this.getIcon(this.unitIcons, entity.size);
        ctx.drawImage(unitIcon, x - halfSize, y - halfSize, size, size);
        this.drawOutlinedText(ctx, entity.text, x, y + halfSize + 11);
        break
      case entity.type === EntityType.OBJECT:
        const objectIcon = await this.getIcon(this.objectIcons, entity.size);
        ctx.drawImage(objectIcon, x - halfSize, y - halfSize, size, size);
        this.drawOutlinedText(ctx, entity.text, x, y + halfSize + 11);
        break;
      case entity.type === EntityType.SELF:
        const selfIcon = await this.getIcon(this.baseIcons, entity.size);
        ctx.drawImage(selfIcon, x - halfSize, y - halfSize, size, size);
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

    if (entity && entity.symbol !== undefined && entity.symbol >= 0) {
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

  private async getIcon(list: HTMLImageElement[], index: number): Promise<HTMLImageElement> {
    const icon = list[index];

    if (!icon) {
      return Promise.reject(new Error(`Icon at index ${index} not found.`));
    }

    if (icon.complete && icon.naturalWidth > 0) {
      return Promise.resolve(icon);
    }

    return new Promise((resolve, reject) => {
      icon.onload = () => resolve(icon);
      icon.onerror = () => reject(new Error(`Could not load icon at index ${index}.`));
    });
  }

  private async loadIcons() {
    this.unitIcons.map((icon, index) => loadImage(ICON_PATHS.units[index], icon));
    this.enemyIcons.map((icon, index) => loadImage(ICON_PATHS.enemies[index], icon));
    this.objectIcons.map((icon, index) => loadImage(ICON_PATHS.objects[index], icon));
    this.baseIcons.map((icon, index) => loadImage(ICON_PATHS.base[index], icon));
    this.symbols.map((icon, index) => loadImage(ICON_PATHS.symbols[index], icon));
  }
}