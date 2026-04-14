import { getAssetUrl } from "../../../common/utils/image";

interface BuildingNumber {
    value: string;
    x: number;
    y: number;
}

export class BuildingNumberRenderer {
    private buildingNumbers: BuildingNumber[] = [];

    constructor() {
        fetch(getAssetUrl('building_numbers.json')).then(r => r.json()).then((data: BuildingNumber[]) => {
            this.buildingNumbers = data;
        });
    }

    render(ctx: CanvasRenderingContext2D, offset: { x: number, y: number }, zoom: number) {
        this.setupTextProperties(ctx, zoom);

        this.buildingNumbers.forEach((entry: BuildingNumber) => {
            const x = entry.x * zoom + offset.x;
            const y = entry.y * zoom + offset.y;

            this.drawTextOutline(ctx, entry.value, x, y, zoom);
            this.drawText(ctx, entry.value, x, y, zoom);
        });
    }

    private setupTextProperties(ctx: CanvasRenderingContext2D, zoom: number) {
        ctx.font = `${this.getFontSize(zoom)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, zoom: number) {
        ctx.fillStyle = '#000000';
        ctx.fillText(text, x, y);
    }

    private drawTextOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, zoom: number) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
    }

    private getFontSize(zoom: number): number {
        const baseSize = 14;
        const minimalSize = 14;
        const maximalSize = 24;
        const scaledSize = baseSize * zoom;

        return Math.max(minimalSize, Math.min(scaledSize, maximalSize));
    }
}