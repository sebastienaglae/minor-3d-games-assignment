import CharacterConfig from "../config/gameobject/character";
import Level from "../level/level";
import AnimationComponent from "./component/animation";
import CombatComponent from "./component/combat";
import HitpointComponent from "./component/hitpoint";
import MovementComponent from "./component/movement";
import RenderComponent from "./component/render";
import GameObject, { GameObjectType } from "./gameObject";

export default class Character extends GameObject {
    private _direction: number;

    public constructor(config: CharacterConfig, level: Level) {
        super(config, level);
        this._direction = 0;

        this.addComponent(new HitpointComponent(this, config.hitpoint, 1));
        this.addComponent(new CombatComponent(this, config.combat));
        this.addComponent(new MovementComponent(this, config.movement));
        this.addComponent(new RenderComponent(this, config.render));
        this.addComponent(new AnimationComponent(this, config.animation));
    }

    public get direction(): number {
        return this._direction;
    }

    public set direction(direction: number) {
        this._direction = direction;
    }

    public load(data: any) {
        super.load(data);
        this._direction = data.direction;
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction;
        return data;
    }

    public get type(): GameObjectType {
        return GameObjectType.Character;
    }
}