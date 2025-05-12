import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  InputSignal,
  ViewChild,
} from '@angular/core';

import { InputLayerService } from '../input/input.layer.service';
import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { Entity } from '../../core/models/entity';
import { EntityLayerService } from './entity.layer.service';

@Component({
  selector: 'trx-entity-layer',
  templateUrl: './entity.layer.component.html',
  styleUrls: ['./entity.layer.component.scss'],
  providers: [EntityLayerService],
})
export class EntityLayerComponent implements AfterViewInit, MapLayer {
  readonly entities: InputSignal<Entity[]> = input<Entity[]>([]);
  
  @ViewChild('entityCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

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

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvasToHost());
    this.resizeObserver.observe(this.hostRef.nativeElement);
    this.resizeCanvasToHost();
  }

  render() {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.entities().forEach((entity) => {
      this.service.drawEntity(ctx, entity);
    })
  }

  private resizeCanvasToHost() {
    const canvas = this.canvasRef.nativeElement;
    const parent = this.hostRef.nativeElement;

    const { width, height } = parent.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    this.render();
  }
}
