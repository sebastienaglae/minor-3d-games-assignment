import { Ray, Vector2 } from "@babylonjs/core";
import GameObjectManager from "../gameobject/manager";
import TileMap, { TileState } from "./tilemap";

export default class Level {
    private _gameObjectManager: GameObjectManager;
    private _tileMap: TileMap;
    
    constructor(size: Vector2, resolution: number) {
        this._tileMap = new TileMap(size, resolution);
        this._gameObjectManager = new GameObjectManager(this);
    }

    public get size(): Vector2 {
        return this._tileMap.size;
    }

    public get resolution(): number {
        return this._tileMap.resolution;
    }

    public get gameObjectManager(): GameObjectManager {
        return this._gameObjectManager;
    }

    public get tileMap(): TileMap {
        return this._tileMap;
    }

    public destroy() {
        this._gameObjectManager.destroy();
    }

    public load(data: any) {
        const objects = data.objects;
        this._gameObjectManager.load(objects);
    }

    public save() : Object {
        return {
            objects: this._gameObjectManager.save()
        };
    }

    public isPassableTile(tile: Vector2): boolean {
        const state = this._tileMap.get(tile);
        const onTerrain = (state & TileState.Terrain) !== 0;
        const onWater = (state & TileState.Water) !== 0;

        if (onWater && !onTerrain) {
            // Water in tile. Can't pass.
            return false;
        }

        if ((state & TileState.Object) !== 0) {
            // Object in tile. Can't pass.
            return false;
        }

        return true;
    }

    public update() {
        this._gameObjectManager.update();
    }
}

export class Collider {
    start: Vector2;
    end: Vector2;

    constructor(start: Vector2, end: Vector2) {
        this.start = start;
        this.end = end;
    }
}