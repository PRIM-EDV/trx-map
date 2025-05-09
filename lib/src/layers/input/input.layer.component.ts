import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { InputLayerService } from './input.layer.service';

@Component({
    selector: 'trx-input-layer',
    templateUrl: './input.layer.component.html',
    styleUrls: ['./input.layer.component.css']
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