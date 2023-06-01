import MonsterConfig from "../config/gameobject/monster";
import Level from "../level/level";
import AnimationComponent from "./component/animation";
import HitpointComponent from "./component/hitpoint";
import MonsterCombatComponent from "./component/monsterCombat";
import AIMovementComponent from "./component/aiMovement";
import RenderComponent from "./component/render";
import GameObject, { GameObjectType } from "./gameObject";

export default class Monster extends GameObject {
    private _direction: number;

    public constructor(config: MonsterConfig, level: Level) {
        super(config, level);
        this._direction = 0;

        this.addComponent(new HitpointComponent(this, config.hitpoint));
        this.addComponent(new AIMovementComponent(this, config.movement));
        this.addComponent(new MonsterCombatComponent(this, config.combat));
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
        if (data.freezePatrol) {
            this.findComponent(MonsterCombatComponent).freezePatrol();
        }
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction;
        data.freezePatrol = this.findComponent(MonsterCombatComponent).isFrozenPatrol;
        return data;
    }

    public get type(): GameObjectType {
        return GameObjectType.Monster;
    }
}