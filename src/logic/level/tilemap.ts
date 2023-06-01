import { Vector2 } from "@babylonjs/core";
import PathFinder from "../util/pathfinder";

export default class TileMap {
    private _resolution: number;
    private _size: Vector2;
    private _subSize: Vector2;
    private _states: Uint8Array;

    private _pathFinder: PathFinder;

    public constructor(size: Vector2, resolution: number) {
        this._size = size;
        this._subSize = new Vector2(size.x * resolution, size.y * resolution);
        this._states = new Uint8Array(this._subSize.x * this._subSize.y);
        this._resolution = resolution;

        this._pathFinder = new PathFinder(this);
    }

    public get size(): Vector2 {
        return this._size;
    }

    public get subSize(): Vector2 {
        return this._subSize;
    }

    public get resolution(): number {
        return this._resolution;
    }

    public get states(): Uint8Array {
        return this._states;
    }

    public get pathFinder(): PathFinder {
        return this._pathFinder;
    }

    public get(position: Vector2): TileState {
        const x = Math.floor(position.x * this._resolution);
        const y = Math.floor(position.y * this._resolution);

        return this.getSubTile(x, y);
    }

    public set(position: Vector2, state: TileState) {
        const x = Math.floor(position.x * this._resolution);
        const y = Math.floor(position.y * this._resolution);

        this.setSubTile(x, y, state);
    }

    public getSubTile(x: number, y: number): TileState {
        if (x < 0 || x >= this._subSize.x || y < 0 || y >= this._subSize.y) {
            return TileState.Object;
        }

        return this._states[x * this._subSize.y + y];
    }

    public setSubTile(x: number, y: number, state: TileState) {
        if (x < 0 || x >= this._subSize.x || y < 0 || y >= this._subSize.y) {
            throw new Error("Position out of bounds");
        }

        this._states[x * this._subSize.y + y] = state;
    }

    public setSubTiles(buffer: Uint8Array, sizeX: number, sizeY: number, precision: number) {
        if (sizeX !== this._subSize.x || sizeY !== this._subSize.y) {
            throw new Error("Invalid size");
        }
        if (precision !== this._resolution) {
            throw new Error("Invalid precision");
        }

        this._states = buffer;
        this._pathFinder.updateGrid();
    }

    public updatePathFinder(): void {
        this._pathFinder.updateGrid();
    }

    public destroy() {
        this._states = new Uint8Array(0);
    }
}

export enum TileState {
    None = 0,
    Terrain = 1 << 0,
    Water = 1 << 1,
    Object = 1 << 2,
}