import { loadImage } from "../../../common/utils/image";

export class TerrainSvgRenderer {
    private terrainSvg: HTMLImageElement = new Image();

    constructor() {
        loadImage('img/terrain/terrain_with_border.svg', this.terrainSvg);
    }

    public async render(ctx: CanvasRenderingContext2D, offset: { x: number, y: number }, zoom: number) {
        const terrainSvg = await this.getTerrainSvg();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(terrainSvg, offset.x, offset.y, 3094 * zoom, 1544 * zoom);
    }

    private async getTerrainSvg(): Promise<HTMLImageElement> {
        if (this.terrainSvg.complete && this.terrainSvg.naturalWidth > 0) {
            return Promise.resolve(this.terrainSvg);
        }

        return new Promise((resolve, reject) => {
            this.terrainSvg.onload = () => resolve(this.terrainSvg);
            this.terrainSvg.onerror = () => reject(new Error(`Could not load terrain SVG.`));
        });
    }
}