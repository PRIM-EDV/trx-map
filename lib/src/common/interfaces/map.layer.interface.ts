export interface MapLayer {
    render(): void;

    onMouseMove?(e: MouseEvent): boolean;
    onPanStart?(e: HammerInput): boolean;
    onPan?(e: HammerInput, offset: { x: number; y: number }): boolean;
    onPanEnd?(e: HammerInput): boolean;
    onPinchStart?(e: HammerInput): boolean;
    onPinch?(e: HammerInput): boolean;
    onScroll?(e: WheelEvent): boolean;
    onClick?(e: MouseEvent): boolean;
    onRightClick?(e: MouseEvent): boolean;
    onDoubleClick?(e: MouseEvent): boolean;
}
