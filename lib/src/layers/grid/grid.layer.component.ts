import { Component, Input, OnInit, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';

import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { resizeCanvasToHost } from '../common/utils/resize';

@Component({
  selector: 'trx-grid-layer',
  templateUrl: './grid.layer.component.html',
  styleUrls: ['./grid.layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridLayerComponent implements AfterViewInit, MapLayer {
  @ViewChild('gridCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private resizeObserver!: ResizeObserver;

  private readonly cellSize = 100;
  private readonly labelSize = 20;
  private readonly gridOffset = { x: 0, y: 0 };

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
    
    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

      this.drawAxisLines(ctx, 25, 'x');
      this.drawAxisLines(ctx, 13, 'y');
      this.drawAxisBackgrounds(ctx);
      this.drawAxisLabels(ctx, 25, 'x', 12);
      this.drawAxisLabels(ctx, 13, 'y', 10);
    });
  }

  ngOnInit(): void {
  }

  private drawAxisBackgrounds(ctx: CanvasRenderingContext2D) {
    const canvas = this.canvasRef.nativeElement;
    
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, canvas.height - this.labelSize, canvas.width, this.labelSize);
    ctx.fillRect(0, 0, this.labelSize, canvas.height);
  }

  private drawAxisLines(ctx: CanvasRenderingContext2D, count: number, axis: 'x' | 'y') {
    const { offset, scale, gridOffset } = this.getAxisProps(axis);
    const canvas = this.canvasRef.nativeElement;
    const zoom = this.map.zoom();

    const step = this.cellSize * scale * zoom;

    ctx.save();
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
    ctx.restore();
  }

  private drawAxisLabels(ctx: CanvasRenderingContext2D, count: number, axis: 'x' | 'y', start: number): void {
    const { offset, scale, gridOffset } = this.getAxisProps(axis);
    const canvas = this.canvasRef.nativeElement;
    const zoom = this.map.zoom();

    const step = this.cellSize * scale * zoom;

    ctx.save();
    ctx.font = '12px Fira Code';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < count - 1; i++) {
      const pos = offset + i * step + gridOffset * scale * zoom;

      if (axis === 'x') {
        ctx.fillText(`X${start + i + 1}`, pos + step / 2, canvas.height - this.labelSize / 2);
      } else {
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`Y${start + count - i}`, -pos - step / 2, this.labelSize / 2);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  private getAxisProps(axis: 'x' | 'y') {
    return {
      offset: this.map.offset()[axis],
      scale: this.map.scale()[axis],
      gridOffset: this.gridOffset[axis]
    };
  }
}