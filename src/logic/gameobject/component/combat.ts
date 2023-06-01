import CombatConfig from "../../config/component/combat";
import ConfigTable from "../../config/table";
import Time from "../../time/time";
import GameObject from "../gameObject";
import Projectile from "../projectile";
import Component, { ComponentType } from "./component";
import HitpointComponent from "./hitpoint";
import {EventList} from "../../util/eventList";

export default class CombatComponent extends Component {
    public onAttack: EventList = new EventList();

    protected _config: CombatConfig;
    private _attackCooldown: number = 0;

    constructor(parent: GameObject = null, config: CombatConfig = null) {
        super(parent);
        this._config = config;
    }

    public get type(): ComponentType {
        return ComponentType.Combat;
    }

    public get canAttack(): boolean {
        return this._attackCooldown <= 0;
    }

    private get team(): number {
        const hitpointComponent = this._parent.getComponent(HitpointComponent);
        return hitpointComponent.team;
    }

    public attack(direction: number): void {
        console.assert(this.canAttack, "Cannot attack");
        console.log("Attack");
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
    }
}