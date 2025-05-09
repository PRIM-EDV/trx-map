import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { InputLayerService } from './input.layer.service';

@Component({
    selector: 'trx-input-layer',
    standalone: true,
    styleUrls: ['./input.layer.component.css'],
    templateUrl: './input.layer.component.html',
})
export class InputLayerComponent implements AfterViewInit {

    constructor(
        private readonly ref: ElementRef<HTMLElement>,
        private readonly service: InputLayerService
    ) { }

    ngOnInit(): void {
        // Initialization logic here
    }

    ngAfterViewInit(): void {
        this.service.initialize(this.ref);
    }

}