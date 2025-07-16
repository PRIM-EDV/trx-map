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
import { Entity } from '../../core/models/entity';
import { EntityLayerService } from './entity.layer.service';
import { resizeCanvasToHost } from '../common/utils/resize';
import { EntityClickEvent } from '../../core/interfaces/entity-click-event.interface';
import { Point } from '../../core/interfaces/point.interface';

@Component({
  selector: 'trx-entity-layer',
  templateUrl: './entity.layer.component.html',
  styleUrls: ['./entity.layer.component.scss'],
  providers: [EntityLayerService],
})
export class EntityLayerComponent implements AfterViewInit, MapLayer {
  readonly entities: InputSignal<Entity[]> = input<Entity[]>([]);
  
  @ViewChild('entityCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() entityContextMenu = new EventEmitter<EntityClickEvent>();

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
    this.input.register(this, 0);

    this.resizeObserver = new ResizeObserver(() => {
      resizeCanvasToHost(this.canvasRef.nativeElement, this.hostRef); 
      this.render();
    });
    this.resizeObserver.observe(this.hostRef.nativeElement);
     
    resizeCanvasToHost(this.canvasRef.nativeElement, this.hostRef); 
    this.render();
  }

  render() {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.entities().forEach((entity) => {
      this.service.drawEntity(ctx, entity);
    })
  }

  onRightClick(e: MouseEvent): boolean {
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
      // this.panState.isPanning = true;
      // this.panState.start = this.map.offset();
      for (const entity of this.entities()) {
        if (this.hitscan(e, entity)) {
          return false;  
        }
      }

      return true;
    }
  
  public onPan(e: any, offset: Point): boolean {
    // if (e.maxPointers === 1 && this.panState.isPanning) {
    //   this.map.offset.set({
    //     x: this.panState.start.x + e.deltaX,
    //     y: this.panState.start.y + e.deltaY,
    //   });
    // }

    return true;
  }

  public onPanEnd(e: HammerInput): boolean {
    // this.panState.isPanning = false;
    return true;
  }

  private hitscan(e: MouseEvent | HammerInput, entity: Entity): boolean {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();
    const x = e instanceof MouseEvent ? e.offsetX : e.center.x;
    const y = e instanceof MouseEvent ? e.offsetY : e.center.y;

    const hitboxSize = 32 * Math.min(0.5, zoom);

    const mapX = (x - this.canvasRef.nativeElement.getBoundingClientRect().left - offset.x) / zoom / scale.x;
    const mapY = (y - this.canvasRef.nativeElement.getBoundingClientRect().top - offset.y) / zoom / scale.y;

    const halfWidth = hitboxSize / (scale.x * zoom);
    const halfHeight = hitboxSize / (scale.y * zoom);

    const withinX = mapX >= entity.position.x - halfWidth && mapX <= entity.position.x + halfWidth;
    const withinY = mapY >= entity.position.y - halfHeight && mapY <= entity.position.y + halfHeight;

    return withinX && withinY;
  }
}
