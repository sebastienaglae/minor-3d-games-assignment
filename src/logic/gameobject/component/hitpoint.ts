import HitpointConfig from "../../config/component/hitpoint";
import Time from "../../time/time";
import GameObject, { GameObjectType } from "../gameObject";
import Component, { ComponentType } from "./component";

export default class HitpointComponent extends Component {
    public onDamage: (amount: number) => void;
    public onHeal: (amount: number) => void;
    public onDeath: () => void;

    private _config: HitpointConfig;
    private _team: number;
    private _hitpoint: number;
    private _regenDelay: number;
    private _deathDespawnDelay: number;

    public constructor(parent: GameObject, config: HitpointConfig = null, team: number = 0) {
        super(parent);
        this._config = config;
        this._hitpoint = config.max;
        this._regenDelay = 0;
        this._team = team;

        this.onDamage = (amount: number) => { };
        this.onHeal = (amount: number) => { };
        this.onDeath = () => { };
    }

    public get type(): ComponentType {
        return ComponentType.Hitpoint;
    }

    public get alive(): boolean {
        return this._hitpoint > 0;
    }

    public get hitpoint(): number {
        return this._hitpoint;
    }

    public get team(): number {
        return this._team;
    }

    public heal(amount: number): void {
        if (!this.alive) {
            return;
        }
        this._hitpoint = Math.min(this._hitpoint + amount, this._config.max);
        this.onHeal(amount);
    }

    public hit(amount: number): void {
        if (!this.alive) {
            return;
        }

        this._hitpoint = Math.max(this._hitpoint - amount, 0);
        this._regenDelay = Time.getTicks(this._config.regenDelay);
        this.onDamage(amount);
        
        if (!this.alive) {
            this._deathDespawnDelay = Time.getTicks(0.75);
            this.onDeath();
        }
    }

    public update(): void {
        this._regenDelay--;
        if (this._regenDelay <= 0 && this._config.regenAmount > 0) {
            this._regenDelay = Time.getTicks(this._config.regenDelay);
            this.heal(this._config.regenAmount);
        }

        if (!this.alive) {
            this._deathDespawnDelay--;
            if (this._deathDespawnDelay <= 0) {
                this.parent.gameObjectManager.removeObject(this.parent);
            }
        }
    }
}