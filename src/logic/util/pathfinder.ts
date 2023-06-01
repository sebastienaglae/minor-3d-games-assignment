import { Vector2 } from "@babylonjs/core";
import TileMap, { TileState } from "../level/tilemap";

import Grid = require("./lib/grid.js");
import Syncfinder = require("./lib/syncfinder_astar.js");

export default class PathFinder {
    private _tileMap: TileMap;
    private _grid: Buffer;
    private _downscaleFactor: number = 1;

    constructor(tileMap: TileMap) {
        this._tileMap = tileMap;
        this._downscaleFactor = 1;
        this.updateGrid();
    }

    public updateGrid(): void {
        const size = new Vector2(Math.floor(this._tileMap.subSize.x / this._downscaleFactor), Math.floor(this._tileMap.subSize.y / this._downscaleFactor));
        const grid = new Array(size.y);
        for (let y = 0; y < size.y; y++) {
            const row = new Array(size.x);
            for (let x = 0; x < size.x; x++) {
                const tile = this._tileMap.getSubTile(x * this._downscaleFactor, y * this._downscaleFactor);
                const hasTerrain = (tile & TileState.Terrain) !== 0;
                const hasObject = (tile & TileState.Object) !== 0;

                const state = hasTerrain && !hasObject ? 0 : 1;
                
                row[x] = state;
            }
            grid[y] = row;
        }

        this._grid = new Grid(size.x, size.y, Grid.bytesFrom2DArray(size.x, size.y, grid));
    }

    public findPath(start: Vector2, end: Vector2): Vector2[] {
        console.log(`Finding path from ${start} to ${end}`);
        
        const resolution = this._tileMap.resolution;
        const subStartX = Math.floor(start.x * resolution / this._downscaleFactor);
        const subStartY = Math.floor(start.y * resolution / this._downscaleFactor);
        const subEndX = Math.floor(end.x * resolution / this._downscaleFactor);
        const subEndY = Math.floor(end.y * resolution / this._downscaleFactor);

        const path = Syncfinder.findPath(subStartX, subStartY, subEndX, subEndY, this._grid, true, false, 1000);
        if (!path) {
            return [];
        }

        const finalPath = PathFinder.buildPath(path, resolution, this._downscaleFactor);

        return finalPath;
    }

    private static buildPath(rawPath: number[], resolution: number, dowscale: number): Vector2[] {
        const out = [];
        let lastPointX = -1;
        let lastPointY = -1;
        let lastLastPointX = -1;
        let lastLastPointY = -1;
        for (let i = 0; i < rawPath.length; i++) {
            const pointRaw = rawPath[i];
            const pointX = pointRaw >>> 16;
            const pointY = pointRaw & 0xFFFF;
            if (lastPointX !== -1 && lastLastPointX !== -1) {
                const lastDeltaX = Math.sign(lastPointX - lastLastPointX);
                const lastDeltaY = Math.sign(lastPointY - lastLastPointY);
                const deltaX = Math.sign(pointX - lastPointX);
                const deltaY = Math.sign(pointY - lastPointY);

                // if the last two points are in a straight line, set the last point to the current point
                if (lastDeltaX === deltaX && lastDeltaY === deltaY) {
                    lastPointX = pointX;
                    lastPointY = pointY;
                    const lastPoint = out[out.length - 1];
                    lastPoint.x = pointX / resolution * dowscale;
                    lastPoint.y = pointY / resolution * dowscale;
                    continue;
                }
            }

            out.push(new Vector2(pointX / resolution * dowscale, pointY / resolution * dowscale));
            lastLastPointX = lastPointX;
            lastLastPointY = lastPointY;
            lastPointX = pointX;
            lastPointY = pointY;
        }

        return out;
    }
}