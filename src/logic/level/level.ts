import { Vector2 } from "@babylonjs/core";
import GameObjectManager from "../gameobject/manager";
import TileMap, { TileState } from "./tilemap";
import MissionManager from "../mission/manager";

export default class Level {
    private readonly _id: number;
    private readonly _missionManager: MissionManager;
    private readonly _gameObjectManager: GameObjectManager;
    private readonly _tileMap: TileMap;

    private readonly _points: Map<number, Vector2> = new Map<number, Vector2>();

    constructor(id: number, size: Vector2, resolution: number) {
        this._id = id;
        this._tileMap = new TileMap(size, resolution);
        this._gameObjectManager = new GameObjectManager(this);
        this._missionManager = new MissionManager(this);
        this._points = new Map<number, Vector2>();
    }

    public get id(): number {
        return this._id;
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

    public get missionManager(): MissionManager {
        return this._missionManager;
    }

    public destroy() {
        this._gameObjectManager.destroy();
    }

    public load(data: any) {
        const objects = data.objects;
        this._gameObjectManager.load(objects);
        const points = data.points;
        this._points.clear();
        for (const point of points) {
            const id = point.id;
            const position = point.position;
            this._points.set(id, new Vector2(position.x, position.y));
        }
    }

    public save() : Object {
        return {
            objects: this._gameObjectManager.save(),
            points: Array.from(this._points.entries()).map(([id, position]) => {
                return {
                    id: id,
                    position: {
                        x: position.x,
                        y: position.y
                    }
                };
            })
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

    public getPoint(id: number): Vector2 {
        return this._points.get(id) || Vector2.Zero();
    }

    public update() {
        this._gameObjectManager.update();
        this._missionManager.update();
    }
}