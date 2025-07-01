import { AfterViewInit, Component, effect, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

import { InputLayerService } from '../input/input.layer.service';
import { MapLayer } from '../common/interfaces/map.layer.interface';
import { MapService } from '../../core/map.service';
import { Point } from '../../core/interfaces/point.interface';
import { PanState } from './interfaces/pan.state.interface';
import { PinchState } from './interfaces/pinch.state.interface';
import { MapClickEvent } from '../../core/interfaces/click-event.interface';
import { resizeCanvasToHost } from '../common/utils/resize';
import { assets } from '../../../assets/assets';

@Component({
  selector: 'trx-terrain-layer',
  templateUrl: './terrain.layer.component.html',
  styleUrls: ['./terrain.layer.component.scss'],
})
export class TerrainLayerComponent implements AfterViewInit, MapLayer {
  @ViewChild('terrainCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() terrainContextMenu = new EventEmitter<MapClickEvent>();

  private onZoomChange = effect(() => {
    this.map.zoom();
    this.render();
  });

  private onOffsetChange = effect(() => {
    this.map.offset();
    this.render();
  });

  private panState: PanState = { isPanning: false, start: { x: 0, y: 0 } };
  private pinchState: PinchState = { startZoom: 1.0 };

  private resizeObserver!: ResizeObserver;
  private terrainSvg: HTMLImageElement = new Image();

  constructor(
    private input: InputLayerService,
    private map: MapService,
    private hostRef: ElementRef<HTMLElement>
  ) {
    this.terrainSvg.src = assets['terrain/terrain.svg'];
  }

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

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  render() {
    const ctx = this.canvasRef?.nativeElement.getContext('2d');
    if (!ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const zoom = this.map.zoom();
    const offset = this.map.offset();

    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage( this.terrainSvg, offset.x, offset.y, 3540 * zoom, 2440 * zoom);
    });
  }

  public onRightClick(e: MouseEvent): boolean {
    e.preventDefault();

    const mapClickEvent: MapClickEvent = Object.assign(e, {
      mapX: (e.x - this.canvasRef.nativeElement.getBoundingClientRect().left - this.map.offset().x) / this.map.zoom(),
      mapY: (e.y - this.canvasRef.nativeElement.getBoundingClientRect().top - this.map.offset().y) / this.map.zoom(),
    });

    this.terrainContextMenu.emit(mapClickEvent);
    return false;
  }

  public onPanStart(e: HammerInput): boolean {
    this.panState.isPanning = true;
    this.panState.start = this.map.offset();

    return true;
  }

  public onPan(e: any, offset: Point): boolean {
    if (e.maxPointers === 1 && this.panState.isPanning) {
      this.map.offset.set({
        x: this.panState.start.x + e.deltaX,
        y: this.panState.start.y + e.deltaY,
      });
    }

    return true;
  }

  public onPanEnd(e: HammerInput): boolean {
    this.panState.isPanning = false;
    return true;
  }

  public onPinchStart(e: HammerInput): boolean {
    this.pinchState.startZoom = this.map.zoom();
    return true;
  }

  public onPinch(e: HammerInput): boolean {
    const canvas = this.canvasRef.nativeElement;
    const offset = this.map.offset();
    const zoom = this.map.zoom();
    const scale = this.pinchState.startZoom / (1 / e.scale);

    const delta = {
      x: ((e.center.x - canvas.getBoundingClientRect().left - offset.x) / zoom) * (zoom - scale),
      y: ((e.center.y - canvas.getBoundingClientRect().top - offset.y) / zoom) * (zoom - scale),
    };

    this.map.offset.set({
      x: offset.x + delta.x,
      y: offset.y + delta.y,
    });

    this.map.zoom.set(scale);

    return true;
  }

  public onScroll(e: WheelEvent): boolean {
    const canvas = this.canvasRef.nativeElement;
    const offset = this.map.offset();
    const zoom = this.map.zoom();
    const scale = zoom / (1 + e.deltaY / 1000);

    const delta = {
      x: ((e.x - canvas.getBoundingClientRect().left - offset.x) / zoom) * (zoom - scale),
      y: ((e.y - canvas.getBoundingClientRect().top - offset.y) / zoom) * (zoom - scale),
    };

    this.map.offset.set({
      x: offset.x + delta.x,
      y: offset.y + delta.y,
    });

    this.map.zoom.set(scale);

    return true;
  }
}
