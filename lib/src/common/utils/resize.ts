import { ElementRef } from '@angular/core';

export function resizeCanvasToHost(canvas: HTMLCanvasElement, host: HTMLElement | ElementRef): void {
  const element = host instanceof ElementRef ? host.nativeElement : host;
  const { width, height } = element.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;
}