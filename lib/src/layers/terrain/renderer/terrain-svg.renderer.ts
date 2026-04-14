import { getAssetUrl } from "../../../common/utils/image";

export class TerrainSvgRenderer {
    private terrainSvg: HTMLImageElement = new Image();

    constructor() {
        this.terrainSvg.src = getAssetUrl('img/terrain/terrain_with_border.svg');
    }

    render(ctx: CanvasRenderingContext2D, offset: { x: number, y: number }, zoom: number) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(this.terrainSvg, offset.x, offset.y, 3094 * zoom, 1544 * zoom);
    }
}