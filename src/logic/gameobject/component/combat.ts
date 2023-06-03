import CombatConfig from "../../config/component/combat";
import ConfigTable from "../../config/table";
import Time from "../../time/time";
import GameObject from "../gameObject";
import Projectile from "../projectile";
import Component, { ComponentType } from "./component";
import HitpointComponent from "./hitpoint";
import {EventList} from "../../util/eventList";
import MovementComponent from "./movement";

export default class CombatComponent extends Component {
    public onAttack: EventList = new EventList();
    public onPrepareAttack: EventList = new EventList();

    protected _config: CombatConfig;
    private _attackCooldown: number = 0;
    private _attackLoading: number = -1;
    private _attackDirection: number = 0;

    constructor(parent: GameObject = null, config: CombatConfig = null) {
        super(parent);
        this._config = config;
    }

    public get type(): ComponentType {
        return ComponentType.Combat;
    }

    public get config(): CombatConfig {
        return this._config;
    }

    public get canAttack(): boolean {
        return this._attackCooldown <= 0 && this._attackLoading < 0;
    }

    public get canAttackWhileMoving(): boolean {
        return this._config.canAttackWhileMoving;
    }

    public get isAttacking(): boolean {
        return this._attackLoading !== -1;
    }

    private get team(): number {
        const hitpointComponent = this._parent.getComponent(HitpointComponent);
        return hitpointComponent.team;
    }

    public prepareAttack(direction: number): void {
        console.assert(this.canAttack, "Cannot attack");
        this._attackLoading = Time.getTicks(this._config.attackLoadingTime);
        this._attackDirection = direction;

        this.parent.direction = direction + Math.PI / 2;

        const movementComponent = this._parent.findComponent(MovementComponent);
        if (movementComponent) {
            movementComponent.freeze(this._attackLoading);
        }

        this.onPrepareAttack.trigger();
    }

    private _attack(direction: number): void {
        this._attackCooldown = Time.getTicks(this._config.attackDelay);
        if (this._config.projectileId) {
            const projectileConfig = ConfigTable.getProjectile(this._config.projectileId);
            const projectile = new Projectile(projectileConfig, this._parent.level);
            projectile.init(direction, this._config.shootDamage, this._config.projectileSpeed, this.team, this._config.shootRadius, Time.getTicks(this._config.projectileLifetime))
            projectile.position.set(this._parent.position.x, this._parent.position.y);
            projectile.direction = direction;
            this._parent.gameObjectManager.addObject(projectile);
        } else {
            const gameObjects = this._parent.gameObjectManager.objects.values();
            const from = this._parent.position;
            for (const gameObject of gameObjects) {
                const position = gameObject.position;
                const distanceX = position.x - from.x;
                const distanceY = position.y - from.y;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
                if (distance <= this._config.shootRadius) {
                    const hitpointComponent = gameObject.findComponent(HitpointComponent);
                    if (hitpointComponent && hitpointComponent.team != this.team) {
                        hitpointComponent.hit(this._config.shootDamage);
                    }
                }
            }             
        }

        this.onAttack.trigger();
    }

    public update(): void {
        if (this._attackCooldown > 0) {
            this._attackCooldown--;
        }
        if (this._attackLoading > 0) {
            this._attackLoading--;
            if (this._attackLoading === 0) {
                this._attackLoading = -1;
                this._attack(this._attackDirection);
            }
        }
    }
}