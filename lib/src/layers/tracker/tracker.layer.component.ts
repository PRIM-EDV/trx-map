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
import { MapService } from '../../core/map.service';
import { Tracker } from '../../core/models/tracker';
import { TrackerLayerService } from './tracker.layer.service';
import { TrackerMouseEvent } from '../../core/interfaces/tracker-mouse-event.interface';
import { ICON_SIZE } from './config/icon.config';
import { MapLayer } from '../../common/interfaces/map.layer.interface';
import { resizeCanvasToHost } from '../../common/utils/resize';

@Component({
  selector: 'trx-tracker-layer',
  templateUrl: './tracker.layer.component.html',
  styleUrls: ['./tracker.layer.component.scss'],
  providers: [TrackerLayerService],
})
export class TrackerLayerComponent implements AfterViewInit, MapLayer {
  readonly trackers: InputSignal<Tracker[]> = input<Tracker[]>([]);

  @ViewChild('trackerCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Output() trackerContextMenu = new EventEmitter<TrackerMouseEvent>();
  @Output() trackerDoubleClick = new EventEmitter<TrackerMouseEvent>();
  @Output() trackerHover = new EventEmitter<TrackerMouseEvent>();

  private resizeObserver!: ResizeObserver;

  private onTrackerChange = effect(() => {
    this.trackers();
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
    private service: TrackerLayerService
  ) {}

  ngAfterViewInit(): void {
    this.input.register(this, 1);

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
      this.trackers().forEach((tracker) => {
        if (tracker.hidden) return;

        try {
          this.service.drawTracker(ctx, tracker);
        } catch (error) {
          console.error(`Error rendering tracker ${tracker}:`, error);
        }
      });
    });
  }

  public onDoubleClick(e: MouseEvent): boolean {
    return true;
  }

  public onMouseMove(e: MouseEvent): boolean {
    for (const tracker of this.trackers()) {
      if (tracker.hidden) continue;
      if (this.hitscan(e, tracker)) {
        const trackerMouseEvent: TrackerMouseEvent = Object.assign(e, { tracker: tracker });
        this.trackerHover.emit(trackerMouseEvent);
        return true;
      }
    }
    this.trackerHover.emit(e);
    return true;
  }

  public onRightClick(e: MouseEvent): boolean {
    return true;
  }

  private hitscan(e: MouseEvent, tracker: Tracker): boolean {
    const offset = this.map.offset();
    const scale = this.map.scale();
    const zoom = this.map.zoom();

    const hitboxSize =  ICON_SIZE * Math.min(0.5, zoom);

    const mapX = (e.x - this.canvasRef.nativeElement.getBoundingClientRect().left - offset.x) / zoom / scale.x;
    const mapY = (e.y - this.canvasRef.nativeElement.getBoundingClientRect().top - offset.y) / zoom / scale.y;

    const halfWidth = hitboxSize / (scale.x * zoom);
    const halfHeight = hitboxSize / (scale.y * zoom);

    const withinX = mapX >= tracker.position.x - halfWidth && mapX <= tracker.position.x + halfWidth;
    const withinY = mapY >= tracker.position.y - halfHeight && mapY <= tracker.position.y + halfHeight;

    return withinX && withinY;
  }
}
