import { Injectable, signal, WritableSignal } from '@angular/core';

import { Point } from './interfaces/point.interface';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  public zoom: WritableSignal<number> = signal(1);
  public offset: WritableSignal<Point> = signal({ x: 0, y: 0 });

  constructor() { }
}
