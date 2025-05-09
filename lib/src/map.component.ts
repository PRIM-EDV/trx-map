import { Component } from '@angular/core';
import { InputLayerService } from './layers/input/input.layer.service';
import { InputLayerComponent } from './layers/input/input.layer.component';
import { TerrainLayerComponent } from './layers/terrain/terrain.layer.component';

@Component({
  selector: 'trx-map',
  imports: [
    InputLayerComponent,
    TerrainLayerComponent
  ],
  templateUrl: './map.component.html',
  standalone: true,
  styles: ``,
  providers: [
    InputLayerService
  ]
})
export class MapComponent {

}
