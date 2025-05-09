import { Component } from '@angular/core';
import { InputLayerService } from './layers/input/input.layer.service';
import { InputLayerComponent } from './layers/input/input.layer.component';
import { TerrainLayerComponent } from './layers/terrain/terrain.layer.component';

import 'hammerjs';

@Component({
  selector: 'trx-map',
  imports: [
    InputLayerComponent,
    TerrainLayerComponent
  ],
  providers: [
    InputLayerService
  ],
  standalone: true,
  styleUrls: ['./map.component.scss'],
  templateUrl: './map.component.html'
})
export class MapComponent {

}
