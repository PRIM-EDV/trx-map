import { Component, Input, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';

import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { resizeCanvasToHost } from '../common/utils/resize';
import { of } from 'rxjs';

@Component({
  selector: 'trx-grid-layer',
  templateUrl: './grid.layer.component.html',
  styleUrls: ['./grid.layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridLayerComponent implements AfterViewInit, MapLayer {
  @ViewChild('gridCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private resizeObserver!: ResizeObserver;

  private readonly cellSize = 30;
  private readonly labelSize = 20;
  private readonly gridOffset = { x: 182, y: 18 };

  private onZoomChange = effect(() => {
    this.map.zoom();
    this.render();
  });

  private onOffsetChange = effect(() => {
    this.map.offset();
    this.render();
  });

  constructor(
    private readonly map: MapService,
    private readonly hostRef: ElementRef<HTMLElement>
  ) {}
  
  ngAfterViewInit(): void {
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

    this.drawAxisLines(ctx, 30, 'x');
    this.drawAxisLines(ctx, 30, 'y');
  }

  ngOnInit(): void {
  }

  private drawAxisLines(ctx: CanvasRenderingContext2D, count: number, axis: 'x' | 'y') {
    const canvas = this.canvasRef.nativeElement;
    const zoom = this.map.zoom();
    const offset = axis === 'x' ? this.map.offset().x : this.map.offset().y;
    const scale = axis === 'x' ? this.map.scale().x : this.map.scale().y;
    const gridOffset = axis === 'x' ? this.gridOffset.x : this.gridOffset.y;
    const step = this.cellSize * scale * zoom;

    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let i = 0; i < count; i++) {
      const pos = offset + i * step + gridOffset * scale * zoom;

      ctx.beginPath();
      if (axis === 'x') {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
      } else {
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
      }
      ctx.stroke();
    }
  }
}