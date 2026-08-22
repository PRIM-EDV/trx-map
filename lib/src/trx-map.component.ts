import { Component, EventEmitter, Input, input, InputSignal, Output, Signal } from '@angular/core';
import { InputLayerService } from './layers/input/input.layer.service';
import { InputLayerComponent } from './layers/input/input.layer.component';
import { TerrainLayerComponent } from './layers/terrain/terrain.layer.component';

import 'hammerjs';
import { MapService } from './core/map.service';
import { EntityLayerComponent } from "./layers/entity/entity.layer.component";
import { Entity } from './core/models/entity';
import { CommonModule } from '@angular/common';
import { EntityMouseEvent, MapClickEvent } from '../public-api';
import { GridLayerComponent } from "./layers/grid/grid.layer.component";
import { TrackerLayerComponent } from "./layers/tracker/tracker.layer.component";
import { Tracker } from './core/models/tracker';
import { TrackerMouseEvent } from './core/interfaces/tracker-mouse-event.interface';

@Component({
  selector: 'trx-map',
  imports: [
    CommonModule,
    InputLayerComponent,
    TerrainLayerComponent,
    EntityLayerComponent,
    GridLayerComponent,
    TrackerLayerComponent
],
  providers: [
    MapService,
    InputLayerService
  ],
  standalone: true,
  styleUrls: ['./trx-map.component.scss'],
  templateUrl: './trx-map.component.html'
})
export class TrxMap {
  @Input() entities: Entity[] = [];
  @Input() trackers: Tracker[] = [];

  @Output() terrainContextMenu = new EventEmitter<MapClickEvent>();
  @Output() entityContextMenu = new EventEmitter<EntityMouseEvent>();
  @Output() entityDoubleClick = new EventEmitter<EntityMouseEvent>();
  @Output() entityHover = new EventEmitter<EntityMouseEvent>();
  @Output() entityMoved = new EventEmitter<Entity>();
  @Output() trackerHover = new EventEmitter<TrackerMouseEvent>();
}
