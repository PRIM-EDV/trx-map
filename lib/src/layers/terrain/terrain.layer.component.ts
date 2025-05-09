import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  ViewChild,
} from '@angular/core';

import { InputLayerService } from '../input/input.layer.service';
import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { Point } from '../../core/interfaces/point.interface';

@Component({
  selector: 'trx-terrain-layer',
  templateUrl: './terrain.layer.component.html',
  styleUrls: ['./terrain.layer.component.scss'],
})
export class TerrainLayerComponent implements AfterViewInit, MapLayer {
  @ViewChild('terrainCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private onZoomChange = effect(() => {
    this.map.zoom();
    this.render();
  });

  private onOffsetChange = effect(() => {
    this.map.offset();
    this.render();
  });

  private panStarted: boolean = false;
  private panStart: Point = { x: 0, y: 0 };
  private terrainSvg: HTMLImageElement = new Image();

  constructor(private input: InputLayerService, private map: MapService) {
    this.terrainSvg.src = 'assets/terrain.svg';
  }

  ngAfterViewInit(): void {
    this.input.register(this, 0);
  }

  render() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const zoom = this.map.zoom();
    const offset = this.map.offset();

    ctx.drawImage(
      this.terrainSvg,
      offset.x * zoom,
      offset.y * zoom,
      3540 * zoom,
      2440 * zoom
    );
  }

  public onPanStart(e: HammerInput): boolean {
    this.panStart = this.map.offset();
    this.panStarted = true;

    return true;
  }

  public onPan(e: any, offset: Point): boolean {
    if (e.maxPointers === 1 && this.panStarted) {
      this.map.offset.set({
        x: this.panStart.x + e.deltaX,
        y: this.panStart.y + e.deltaY,
      });
    }

    return true;
  }

  public onPanEnd(e: HammerInput): boolean {
    this.panStarted = false;
    return true;
  }

   public onPinch(e: HammerInput): boolean {
        const canvas = this.canvasRef.nativeElement;
        const offset = this.map.offset();
        const scale = this.map.zoom() / (1 / e.scale);
        const zoom = this.map.zoom();

        const delta = {
            x: ((e.center.x - canvas.getBoundingClientRect().left - offset.x) / zoom) * (zoom - scale), 
            y: ((e.center.y - canvas.getBoundingClientRect().top - offset.y) / zoom) * (zoom - scale)
        }

        this.map.offset.set( {
            x: offset.x + delta.x,
            y: offset.y + delta.y
        });;
        this.map.zoom.set(scale);

        return true;
    }
}
