import { ElementRef, Injectable } from '@angular/core';

import { MapLayer } from '../common/interfaces/map.layer.interface';

@Injectable()
export class InputLayerService {
  private host!: ElementRef<HTMLElement>;
  private layers: { layer: MapLayer; z: number }[] = [];
  private mc!: HammerManager;

  constructor() {}

  /**
   * Initializes the input layer by attaching gesture and pointer event handlers
   * to the given DOM host element.
   *
   * @param {ElementRef<HTMLElement>} host - Reference to the DOM container element.
   */
  public initialize(host: ElementRef) {
    this.host = host;
    this.mc = new Hammer.Manager(host.nativeElement);

    this.mc.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }));
    this.mc.add(new Hammer.Pinch());

    this.initializeClickHandlers();
    this.initializePanHandlers();
    this.initializePinchHandlers();
    this.initializeScroll();
  }

  /**
   * Registers a new map layer to receive input events.
   * Layers are ordered by their z-index (highest z receives events first).
   *
   * @param {MapLayer} layer - The layer to register.
   * @param {number} z - The z-index of the layer.
   */
  public register(layer: MapLayer, z: number) {
    this.layers.push({ layer, z });
    this.layers.sort((a, b) => a.z - b.z);
  }

  /**
   * Dispatches an input event to all registered layers from top to bottom.
   * Stops propagation if a layer handler explicitly returns `false`.
   *
   * @template K
   * @param {K} method - The method name of the handler (e.g. 'onClick').
   * @param {HammerInput | WheelEvent | MouseEvent} event - The event object.
   * @param {...any[]} args - Optional additional arguments.
   */
  private dispatch<K extends keyof MapLayer>(
    method: K,
    event: HammerInput | WheelEvent | MouseEvent,
    ...args: any[]
  ) {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const handler = this.layers[i].layer[method] as Function | undefined;
      if (handler && handler.call(this.layers[i].layer, event, ...args) === false) break;
    }
  }

  /**
   * Initializes click event handlers for the host element.
   * These handlers dispatch click, right-click, and double-click events.
   */
  private initializeClickHandlers() {
    this.host.nativeElement.addEventListener('click', (e: MouseEvent) => {
      this.dispatch('onClick', e);
    });
    this.host.nativeElement.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      this.dispatch('onRightClick', e);
    });
    this.host.nativeElement.addEventListener('dblclick', (e: MouseEvent) => {
      this.dispatch('onDoubleClick', e);
    });
  }

  /**
   * Initializes pan event handlers using Hammer.js.
   * These handlers dispatch pan start, pan, and pan end events.
   */
  private initializePanHandlers() {
    this.mc.on('panstart', (e: HammerInput) => {
      this.dispatch('onPanStart', e);
    });
    this.mc.on('pan', (e: HammerInput) => {
      this.dispatch('onPan', e, { x: e.deltaX, y: e.deltaY });
    });
    this.mc.on('panend', (e: HammerInput) => {
      this.dispatch('onPanEnd', e);
    });
  }

  /**
   * Initializes pinch event handlers using Hammer.js.
   * These handlers dispatch pinch start and pinch events.
   */
  private initializePinchHandlers() {
    this.mc.on('pinchstart', (e: HammerInput) => {
      this.dispatch('onPinchStart', e);
    });
    this.mc.on('pinch', (e: HammerInput) => {
      this.dispatch('onPinch', e);
    });
  }

  /**
   * Initializes scroll event handlers for the host element.
   * These handlers dispatch scroll events.
   */
  private initializeScroll() {
    document.addEventListener('wheel', (e: any) => {
      if (this.host.nativeElement.contains(e.target)) {
        this.dispatch('onScroll', e);
      }
    });
  }
}
