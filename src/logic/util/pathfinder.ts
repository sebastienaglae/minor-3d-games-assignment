import { Vector2 } from "@babylonjs/core";
import { AStarFinder } from 'astar-typescript';
import TileMap, { TileState } from "../level/tilemap";

export default class PathFinder {
    private _tileMap: TileMap;
    private _finder: AStarFinder;

    constructor(tileMap: TileMap) {
        this._tileMap = tileMap;
        this.updateGrid();
    }

    public updateGrid(): void {
        const size = this._tileMap.size;
        const resolution = this._tileMap.resolution;
        const grid = new Array(size.y * resolution);
        for (let y = 0; y < size.y * resolution; y++) {
            grid[y] = new Array(size.x * resolution);
            for (let x = 0; x < size.x * resolution; x++) {
                const tile = this._tileMap.getSubTile(x, y);
                const hasTerrain = (tile & TileState.Terrain) !== 0;
                const hasObject = (tile & TileState.Object) !== 0;

                if (hasTerrain && !hasObject) {
                    grid[y][x] = 0;
                } else {
                    grid[y][x] = 1;
                }
            }
        }

        this._finder = new AStarFinder({
            grid: {
                width: size.x * resolution,
                height: size.y * resolution,
                matrix: grid
            }
        });
    }

    public findPath(start: Vector2, end: Vector2): Vector2[] {
        console.log(`Finding path from ${start} to ${end}`);
        
        const subStart = new Vector2(
            Math.floor(start.x * this._tileMap.resolution),
            Math.floor(start.y * this._tileMap.resolution)
        );
        const subEnd = new Vector2(
            Math.floor(end.x * this._tileMap.resolution),
            Math.floor(end.y * this._tileMap.resolution)
        );

        const resolution = this._tileMap.resolution;
        const path = this._finder.findPath(
            subStart,
            subEnd
        );

        return path.map(p => new Vector2(p[0] / resolution, p[1] / resolution));
    }
}