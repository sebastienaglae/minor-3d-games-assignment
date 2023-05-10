import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import Config from "../config/config";
import Level from "../level/level";
import Component, { ComponentType } from "./component/component";
import GameObjectManager from "./manager";
import HitpointComponent from "./component/hitpoint";

export default abstract class GameObject {
    private readonly _level: Level;
    private readonly _components: Map<ComponentType, Component> = new Map();
    private readonly _config: Config;

    private _id: number;
    private _position: Vector2;

    constructor(config: Config, level: Level) {
        this._level = level;
        this._config = config;
        this._id = -1;
        this._position = Vector2.Zero();
    }

    public destroy(): void {
        this._components.forEach((component) => {
            component.destroy();
        });
        this._components.clear();
    }

    public get id(): number {
        return this._id;
    }

    public set id(id: number) {
        this._id = id;
    }

    public get level(): Level {
        return this._level;
    }

    public get gameObjectManager(): GameObjectManager {
        return this._level.gameObjectManager;
    }

    public get config(): Config {
        return this._config;
    }

    public get position(): Vector2 {
        return this._position;
    }

    public set position(position: Vector2) {
        this._position = position;
    }

    public get direction(): number {
        return 0;
    }

    public set direction(direction: number) {
        // do nothing
    }
    
    public get team(): number {
        const hitpointComponent = this.findComponent(HitpointComponent);
        if (hitpointComponent) {
            return hitpointComponent.team;
        }
        return -1;
    }

    public get alive(): boolean {
        const hitpointComponent = this.findComponent(HitpointComponent);
        if (hitpointComponent) {
            return hitpointComponent.alive;
        }
        return false;
    }

    public getComponent<T extends Component>(s: new (parent: GameObject) => T): T {
        const type = s.prototype.type;
        if (!this._components.has(type)) {
            throw new Error(`Component of type ${type} does not exist.`);
        }
        return this._components.get(type) as T;
    }

    public findComponent<T extends Component>(s: new (parent: GameObject) => T): T {
        const type = s.prototype.type;
        if (!this._components.has(type)) {
            return null;
        }
        return this._components.get(type) as T;
    }

    public addComponent(component: Component): void {
        if (this._components.has(component.type)) {
            throw new Error(`Component of type ${component.type} already exists.`);
        }
        this._components.set(component.type, component);
    }

    public update() {
        this._components.forEach((component) => {
            component.update();
        });
    }

    public load(data: any) {
        this._id = data.id;
        this._position = new Vector2(data.position.x, data.position.y);
    }

    public save(): any {
        return {
            id: this._id,
            position: {
                x: this._position.x,
                y: this._position.y
            }
        };
    }

    public abstract get type(): GameObjectType;
}

export enum GameObjectType {
    Character = 0,
    Monster = 1,
    Projectile = 2,
}