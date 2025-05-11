import { Component, Input, input, InputSignal, Signal } from '@angular/core';
import { InputLayerService } from './layers/input/input.layer.service';
import { InputLayerComponent } from './layers/input/input.layer.component';
import { TerrainLayerComponent } from './layers/terrain/terrain.layer.component';

import 'hammerjs';
import { MapService } from './core/map.service';
import { EntityLayerComponent } from "./layers/entity/entity.layer.component";
import { Entity } from './core/models/entity';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'trx-map',
  imports: [
    CommonModule,
    InputLayerComponent,
    TerrainLayerComponent,
    EntityLayerComponent
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
}
