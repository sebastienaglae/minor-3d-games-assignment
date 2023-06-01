import MissionConfig, {MissionType} from "../config/mission";
import Trigger from "../gameobject/trigger";
import Level from "../level/level";
import Monster from "../gameobject/monster";
import HitpointComponent from "../gameobject/component/hitpoint";
import Npc from "../gameobject/npc";
import {Vector2} from "@babylonjs/core";
import Time from "../time/time";
import AIMovementComponent from "../gameobject/component/aiMovement";

export default class Mission {
    private readonly _config: MissionConfig;
    private readonly _level: Level;
    private readonly _requiredProgress: number;
    private _progress: number;

    private readonly _npc: Npc;
    private readonly _npcMovePoints: Vector2[];

    private _completed: boolean;

    constructor(config: MissionConfig, level: Level) {
        this._config = config;
        this._level = level;
        this._requiredProgress = 1;
        this._progress = 0;
        this._npc = null;
        this._npcMovePoints = [];

        switch (this._config.type) {
            case MissionType.TRIGGER:
            {
                this._requiredProgress = this._config.triggerIds.length;

                const gameObjectManager = level.gameObjectManager;
                for (const triggerId of this._config.triggerIds) {
                    const triggerObject = gameObjectManager.getObject(triggerId) as Trigger;
                    if (triggerObject.triggered) {
                        this._progress++;
                        continue;
                    }

                    triggerObject.onTrigger.add(this.completionEvent.bind(this));
                    console.log(`Mission ${this._config.id} is waiting for trigger ${triggerId}`);
                }

                break;
            }

            case MissionType.KILL_MONSTERS:
            {
                this._requiredProgress = this._config.monsterIds.length;

                const gameObjectManager = level.gameObjectManager;
                for (const monsterId of this._config.monsterIds) {
                    const monsterObject = gameObjectManager.getObject(monsterId) as Monster;
                    if (!monsterObject) {
                        this._progress++;
                        continue;
                    }

                    const hitpointComponent = monsterObject.findComponent(HitpointComponent);
                    if (hitpointComponent === null || !hitpointComponent.alive) {
                        this._progress++;
                        continue;
                    }

                    hitpointComponent.onDeath.add(this.completionEvent.bind(this));
                }

                break;
            }

            case MissionType.KILL_ANY_MONSTER:
            {
                this._requiredProgress = this._config.monsterCount;
                this._progress = Math.max(this._config.monsterCount - this.calculateTotalKillableMonsters(), 0);
                break;
            }

            case MissionType.FOLLOW_NPC:
            {
                this._requiredProgress = this._config.npcMovePointIds.length;
                this._npc = level.gameObjectManager.getObject(this._config.npcId) as Npc;
                if (!this._npc) {
                    console.warn(`Mission ${this._config.id} has no NPC`);
                    this._progress = this._requiredProgress;
                    break;
                }

                for (const movePointId of this._config.npcMovePointIds) {
                    this._npcMovePoints.push(level.getPoint(movePointId));
                }

                break;
            }
        }

        if (this._config.tpPoint != 0) {
            const tpPoint = level.getPoint(this._config.tpPoint);
            const player = level.gameObjectManager.player;
            player.position = tpPoint.clone();
        }

        if (this._progress >= this._requiredProgress) {
            this.complete();
        }
    }

    public start(): void {
        console.log(`Mission ${this._config.id} is started`);

        if (this._config.type === MissionType.FOLLOW_NPC) {
            this.moveNpcToNextPoint();
        }
    }

    private completionEvent() {
        if (this._progress < this._requiredProgress) {
            this._progress++;
            if (this._progress >= this._requiredProgress) {
                this.complete();
            }
        }
    }

    public complete(): void {
        this._progress = this._requiredProgress;
        this._completed = true;

        console.log(`Mission ${this._config.id} is completed`);
    }

    public get config(): MissionConfig {
        return this._config;
    }

    public get isCompleted(): boolean {
        return this._completed;
    }

    public get npc(): Npc {
        return this._npc;
    }

    public get progress(): number {
        return this._progress;
    }

    public get requiredProgress(): number {
        return this._requiredProgress;
    }

    public update() {
        if (this._config.type === MissionType.FOLLOW_NPC) {
            const npcPosition = this._npc.position;
            const npcMovePoint = this._npcMovePoints[this._progress];
            const distance = Vector2.DistanceSquared(npcPosition, npcMovePoint);
            if (distance < 0.1) {
                this.completionEvent();
                if (this._progress < this._requiredProgress) {
                    this.moveNpcToNextPoint();
                }
            }
        }
    }

    public moveNpcToNextPoint(): void {
        const nextMovePoint = this._npcMovePoints[this._progress];
        this._npc.getComponent(AIMovementComponent).moveTo(nextMovePoint);
    }

    public calculateTotalKillableMonsters(): number {
        const gameObjectManager = this._level.gameObjectManager;
        let totalKillableMonsters = 0;
        for (const obj of gameObjectManager.objects.values()) {
            if (obj instanceof Monster) {
                const hitpointComponent = obj.findComponent(HitpointComponent);
                if (hitpointComponent === null || !hitpointComponent.alive) {
                    continue;
                }

                totalKillableMonsters++;
            }
        }

        return totalKillableMonsters;
    }
}