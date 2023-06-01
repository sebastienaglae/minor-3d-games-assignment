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

    private _attachedToMission: boolean = false;

    private _patrolPoints: Vector2[] = [];
    private _patrolIndex: number = 0;
    private _reversePatrol: boolean = false;

    private _patrolEndRollbackDelay: number = 0;
    private _patrolFreezeTime: number = 0;

    public constructor(config: NpcConfig, level: Level) {
        super(config, level);
        this._direction = 0;

        this.addComponent(new AIMovementComponent(this, ConfigTable.globals.npcPatrolMovement));
        this.addComponent(new RenderComponent(this, config.render));
        this.addComponent(new AnimationComponent(this, config.animation));

        this._startWaitingDistance = ConfigTable.globals.npcStartWaitingPlayerDistance;
        this._endWaitingDistance = ConfigTable.globals.npcStartChasingPlayerDistance;
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
        this._patrolPoints = data.patrolPoints || [];
        this._patrolIndex = 0;
        this._patrolEndRollbackDelay = Time.getTicks(data.patrolEndRollbackDelay) || 0;
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction || 0;
        data.patrolPoints = this._patrolPoints;
        data.patrolEndRollbackDelay = Time.getSeconds(this._patrolEndRollbackDelay);
        return data;
    }

    public get type(): GameObjectType {
        return GameObjectType.Npc;
    }

    public get attachedToMission(): boolean {
        return this._attachedToMission;
    }

    public set attachedToMission(attachedToMission: boolean) {
        this._attachedToMission = attachedToMission;
        this._waitingCheckTimer = Time.getTicks(0.5);

        const movementComponent = this.getComponent(AIMovementComponent);
        movementComponent.config = attachedToMission ? ConfigTable.globals.npcMovement : ConfigTable.globals.npcPatrolMovement;
    }

    public get isPatrolFrozen(): boolean {
        return this._patrolFreezeTime > 0;
    }

    public set isPatrolFrozen(isPatrolFrozen: boolean) {
        this._patrolFreezeTime = isPatrolFrozen ? 100000000 : 0;
    }

    public update(): void {
        super.update();

        if (this._patrolFreezeTime > 0) {
            if (this._patrolFreezeTime-- > 0) {
                return;
            }
        }

        if (this._attachedToMission) {
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
        } else {
            const movementComponent = this.getComponent(AIMovementComponent);
            if (!movementComponent.moving) {
                if (this._patrolPoints.length > 0) {
                    const index = this._reversePatrol ? this._patrolPoints.length - this._patrolIndex - 1 : this._patrolIndex;
                    const nextPatrolPoint = this._patrolPoints[index];
                    if (nextPatrolPoint) {
                        movementComponent.moveTo(nextPatrolPoint);
                        this._patrolIndex++;
                    } else {
                        this._reversePatrol = true;
                        this._patrolIndex = 0;
                        this._patrolFreezeTime = Time.getTicks(this._patrolEndRollbackDelay);
                    }
                }
            }
        }
    }
}