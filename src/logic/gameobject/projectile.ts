import { Vector2, Vector3 } from "@babylonjs/core";
import ProjectileConfig from "../config/gameobject/projectile";
import Level from "../level/level";
import RenderComponent from "./component/render";
import GameObject, { GameObjectType } from "./gameObject";
import HitpointComponent from "./component/hitpoint";
import Time from "../time/time";

export default class Projectile extends GameObject {
    private _direction: number;
    private _damage: number;
    private _speed: number;
    private _team: number;
    private _radius: number;
    private _lifeTime: number;

    constructor(config: ProjectileConfig, level: Level) {
        super(config, level);
        
        this.addComponent(new RenderComponent(this, config.render));
    }

    public init(direction: number, damage: number, speed: number, team: number, radius: number, lifeTime: number) {
        this._direction = direction;
        this._damage = damage;
        this._speed = speed;
        this._team = team;
        this._radius = radius;
        this._lifeTime = lifeTime;
    }

    public get type(): GameObjectType {
        return GameObjectType.Projectile;
    }

    public get direction(): number {
        return this._direction;
    }

    public set direction(direction: number) {
        this._direction = direction;
    }
    
    public update(): void {        
        this._lifeTime--;
        if (this._lifeTime == 0) {
            this.gameObjectManager.removeObject(this);
            return;
        }

        const from = this.position;
        const to = this.position.clone();
        to.x += Math.cos(this._direction) * this._speed * Time.TICK_DELTA_TIME;
        to.y += Math.sin(this._direction) * this._speed * Time.TICK_DELTA_TIME;

        let hasCollision = false;
        const gameObjects = this.gameObjectManager.objects.values();
        for (const gameObject of gameObjects) {
            const position = gameObject.position;
            if (this.isInLine(from, to, this._radius, position)) {
                const hitpointComponent = gameObject.findComponent(HitpointComponent);
                if (hitpointComponent !== null && hitpointComponent.team != this._team) {
                    hitpointComponent.hit(this._damage);
                    hasCollision = true;
                }
            }
        }

        if (hasCollision) {
            this.gameObjectManager.removeObject(this);
        }
    
        this.position = to;

        super.update();
    }

    private isInLine(from: Vector2, to: Vector2, range: number, position: Vector2): boolean {
        // check if the position is in the line
        const a = from.clone().add(new Vector2(-range, -range));
        const b = from.clone().add(new Vector2(range, -range));
        const c = from.clone().add(new Vector2(range, range));
        const d = from.clone().add(new Vector2(-range, range));

        const ab = this.isInTriangle(a, b, to, position);
        const bc = this.isInTriangle(b, c, to, position);
        const cd = this.isInTriangle(c, d, to, position);

        return ab || bc || cd;
    }

    private isInTriangle(a: Vector2, b: Vector2, c: Vector2, position: Vector2): boolean {
        const as_x = position.x - a.x;
        const as_y = position.y - a.y;

        const s_ab = (b.x - a.x) * as_y - (b.y - a.y) * as_x > 0;

        if ((c.x - a.x) * as_y - (c.y - a.y) * as_x > 0 == s_ab) return false;
        if ((c.x - b.x) * (position.y - b.y) - (c.y - b.y) * (position.x - b.x) > 0 != s_ab) return false;

        return true;
    }
}