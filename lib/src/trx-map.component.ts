import { Component } from '@angular/core';
import { InputLayerService } from './layers/input/input.layer.service';
import { InputLayerComponent } from './layers/input/input.layer.component';
import { TerrainLayerComponent } from './layers/terrain/terrain.layer.component';

import 'hammerjs';
import { MapService } from './core/map.service';

@Component({
  selector: 'trx-map',
  imports: [
    InputLayerComponent,
    TerrainLayerComponent
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

}
