import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  input,
  InputSignal,
  Output,
  ViewChild,
} from '@angular/core';

import { InputLayerService } from '../input/input.layer.service';
import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { Entity, EntityState, EntityType } from '../../core/models/entity';
import { EntityLayerService } from './entity.layer.service';
import { resizeCanvasToHost } from '../common/utils/resize';
import { EntityClickEvent } from '../../core/interfaces/entity-click-event.interface';
import { Point } from '../../core/interfaces/point.interface';
import { PanState } from '../common/interfaces/pan.state.interface';
import { ICON_SIZE } from './config/icon.config';

@Component({
  selector: 'trx-entity-layer',
  templateUrl: './entity.layer.component.html',
  styleUrls: ['./entity.layer.component.scss'],
  providers: [EntityLayerService],
})
export class EntityLayerComponent implements AfterViewInit, MapLayer {
  readonly entities: InputSignal<Entity[]> = input<Entity[]>([]);
  
  @ViewChild('entityCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('entityAnimationCanvas', { static: true }) animationCanvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() entityContextMenu = new EventEmitter<EntityClickEvent>();
  @Output() entityDoubleClick = new EventEmitter<EntityClickEvent>();
  @Output() entityMoved = new EventEmitter<Entity>();

  private panState: PanState = { isPanning: false, start: { x: 0, y: 0 } };
  private panEntity: Entity | null = null;
  private resizeObserver!: ResizeObserver;

  private onEntityChange = effect(() => {
    this.entities();
    this.render();
  });

  private onZoomChange = effect(() => {
    this.map.zoom();
    this.render();
  });

  private onOffsetChange = effect(() => {
    this.map.offset();
    this.render();
  });

  constructor(
    private hostRef: ElementRef<HTMLElement>,
    private input: InputLayerService,
    private map: MapService,
    private service: EntityLayerService
  ) {}

  ngAfterViewInit(): void {
    this.input.register(this, 1);

    this.resizeObserver = new ResizeObserver(() => {
      resizeCanvasToHost(this.canvasRef.nativeElement, this.hostRef);
      resizeCanvasToHost(this.animationCanvasRef.nativeElement, this.hostRef);
      this.render();
    });
    this.resizeObserver.observe(this.hostRef.nativeElement);
     
    resizeCanvasToHost(this.canvasRef.nativeElement, this.hostRef);
    resizeCanvasToHost(this.animationCanvasRef.nativeElement, this.hostRef);

    this.render();

    this.initializePingAnimation();
  }

  render() {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.entities().forEach((entity) => {
      try {
        this.service.drawEntity(ctx, entity);
      } catch (error) {
        console.error(`Error rendering entity ${entity}:`, error);
      }
    })
  }

  public onDoubleClick(e: MouseEvent): boolean {
    e.preventDefault();

    for (const entity of this.entities()) {
      if (this.hitscan(e, entity)) {
        const entityClickEvent: EntityClickEvent = Object.assign(e, { entity: entity });
        this.entityDoubleClick.emit(entityClickEvent);
        return false;
      }
    }
    return true;
  }

  public onRightClick(e: MouseEvent): boolean {
    e.preventDefault();

    for (const entity of this.entities()) {
      if (this.hitscan(e, entity)) {
        const entityClickEvent: EntityClickEvent = Object.assign(e, { entity: entity });
        this.entityContextMenu.emit(entityClickEvent);
        return false;
      }
    }
    return true;
  }

  public onPanStart(e: HammerInput): boolean {
      for (const entity of this.entities()) {
        if (this.hitscan(e, entity)) {
          this.panEntity = entity;
          this.panState.isPanning = true;
          this.panState.start = {
            x: (e.center.x - this.canvasRef.nativeElement.getBoundingClientRect().left - this.map.offset().x) / this.map.zoom() / this.map.scale().x,
            y: (e.center.y - this.canvasRef.nativeElement.getBoundingClientRect().top - this.map.offset().y) / this.map.zoom() / this.map.scale().y,
          }
          return false;
        }
      }
      return true;
    }
  
  public onPan(e: any, offset: Point): boolean {
    if (e.maxPointers === 1 && this.panState.isPanning && this.panEntity) {
        this.panEntity.position.x = this.panState.start.x + e.deltaX / this.map.zoom() / this.map.scale().x;
        this.panEntity.position.y = this.panState.start.y + e.deltaY / this.map.zoom() / this.map.scale().y;
        this.render();
    }
    return true;
  }

  public onPanEnd(e: HammerInput): boolean {
    if (this.panEntity) {
      this.entityMoved.emit(this.panEntity);
      this.panEntity = null;
    }
    
    this.panState.isPanning = false;
    return true;
  }

  private hitscan(e: MouseEvent | HammerInput, entity: Entity): boolean {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();
    const x = e instanceof MouseEvent ? e.x : e.center.x;
    const y = e instanceof MouseEvent ? e.y : e.center.y;

    const hitboxSize = ICON_SIZE * Math.min(0.5, zoom);

    const mapX = (x - this.canvasRef.nativeElement.getBoundingClientRect().left - offset.x) / zoom / scale.x;
    const mapY = (y - this.canvasRef.nativeElement.getBoundingClientRect().top - offset.y) / zoom / scale.y;

    const halfWidth = hitboxSize / (scale.x * zoom);
    const halfHeight = hitboxSize / (scale.y * zoom);

    const withinX = mapX >= entity.position.x - halfWidth && mapX <= entity.position.x + halfWidth;
    const withinY = mapY >= entity.position.y - halfHeight && mapY <= entity.position.y + halfHeight;

    return withinX && withinY;
  }

  private initializePingAnimation() {
    const animationCtx = this.animationCanvasRef?.nativeElement.getContext('2d');
    if (!animationCtx) return;

    const animationDuration = 1000; 
    const animationStart = performance.now();
    const animate = (timestamp: number) => {
        const elapsed = timestamp - animationStart;
        const progress = (elapsed % animationDuration) / animationDuration;

        animationCtx.clearRect(0, 0, this.animationCanvasRef?.nativeElement.width, this.animationCanvasRef?.nativeElement.height);
        this.entities().forEach((entity) => {
            if (entity.type === EntityType.FRIEND && entity.state === EntityState.BATTLE) {
                this.service.drawEntityPing(animationCtx, entity, progress);
            }
        });

        requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}
