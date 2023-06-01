import Level from "../level/level";
import AnimationComponent from "./component/animation";
import AIMovementComponent from "./component/aiMovement";
import RenderComponent from "./component/render";
import GameObject, { GameObjectType } from "./gameObject";
import NpcConfig from "../config/gameobject/npc";
import ConfigTable from "../config/table";
import Time from "../time/time";
import { Vector2 } from "@babylonjs/core";
import CombatComponent from "./component/combat";

export default class Npc extends GameObject {
    private _direction: number;
    private _startWaitingDistance: number = 0;
    private _endWaitingDistance: number = 0;
    private _waitingCheckTimer: number = 0;

    public constructor(config: NpcConfig, level: Level) {
        super(config, level);
        this._direction = 0;

        this.addComponent(new AIMovementComponent(this, ConfigTable.globals.npcMovement));
        this.addComponent(new RenderComponent(this, config.render));
        this.addComponent(new AnimationComponent(this, config.animation));

        this._startWaitingDistance = ConfigTable.globals.npcStartWaitingPlayerDistance;
        this._endWaitingDistance = ConfigTable.globals.npcStartChasingPlayerDistance;
        this._waitingCheckTimer = Time.getTicks(0.5);
    }

    public get direction(): number {
        return this._direction;
    }

    public set direction(direction: number) {
        this._direction = direction;
    }

    public load(data: any) {
        super.load(data);
        this._direction = data.direction || 0;
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction || 0;
        return data;
    }

    public get type(): GameObjectType {
        return GameObjectType.Npc;
    }

    public update(): void {
        super.update();

        if (--this._waitingCheckTimer <= 0) {
            this._waitingCheckTimer = Time.getTicks(0.5);
            const player = this.gameObjectManager.player;
            if (player) {
                const movementComponent = this.getComponent(AIMovementComponent);
                const distanceSquared = Vector2.DistanceSquared(this.position, player.position);
                if (distanceSquared >= this._startWaitingDistance * this._startWaitingDistance) {
                    movementComponent.pause();
                } else if (distanceSquared <= this._endWaitingDistance * this._endWaitingDistance) {
                    movementComponent.resume();
                }
            }
        }
    }
}