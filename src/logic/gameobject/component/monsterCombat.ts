import { Nullable, Vector2 } from "@babylonjs/core";
import MonsterCombatConfig from "../../config/component/monsterCombat";
import GameObject from "../gameObject";
import CombatComponent from "./combat";
import Component, { ComponentType } from "./component";
import Time from "../../time/time";
import AIMovementComponent from "./aiMovement";
import Monster from "../monster";

export default class MonsterCombatComponent extends CombatComponent {
    private static readonly AlertCheckTimer: number = Time.getTicks(1);
    private static readonly PatrolStayTimer: number = Time.getTicks(2.5);
    private static readonly NumPatrolPoints: number = 4;

    private _patrolPoints: Vector2[];
    private _patrolRadius: number;
    private _patrolPointIndex: number = -1;
    private _patrolStayTimer: number;

    private _alertInRadius: number;
    private _alertOutRadius: number;
    private _alertCheckDelay: number;

    private _alerted: boolean;

    private _currentTarget: Nullable<GameObject>;
    private _currentTargetPosition: Vector2;

    private _freezeTime: number;

    public constructor(parent: GameObject, config: MonsterCombatConfig = null) {
        super(parent, config);
        this._alertInRadius = config.alertInRadius;
        this._alertOutRadius = config.alertOutRadius;
        this._patrolRadius = config.patrolRadius;
    }

    public get type(): ComponentType {
        return ComponentType.MonsterCombat;
    }

    public freezePatrol() {
        this._patrolPoints = [new Vector2(this.parent.position.x, this.parent.position.y)];
        this._patrolPointIndex = 0;
    }

    public get isFrozenPatrol(): boolean {
        return this._patrolPoints != null && this._patrolPoints.length == 1;
    }

    public get isAlerted(): boolean {
        return this._alerted;
    }

    public update(): void {
        super.update();

        if (!this.parent.alive) {
            return;
        }

        if (--this._freezeTime > 0) {
            return;
        }

        if (this._patrolPoints == null) {
            this.calculatePatrolPoints();
        }

        this.checkAlert();
        this.checkAttack();
        this.checkPatrol();
    }

    private checkAlert(): void {
        this._alertCheckDelay--;
        if (this._alertCheckDelay > 0) {
            return;
        }

        this._alertCheckDelay = MonsterCombatComponent.AlertCheckTimer;

        const enemy = this.findEnemyInRadius(this._alerted ? this._alertOutRadius : this._alertInRadius);
        if (enemy != null) {
            this._alerted = true;
            this.setTarget(enemy);
        } else {
            this._alerted = false;
            this.setTarget(null);
        }
    }

    private checkAttack(): void {
        const target = this._currentTarget;
        if (target == null) {
            return;
        }

        if (!this.canAttack) {
            return;
        }

        const from = this._parent.position;
        const to = target.position;
        const distanceSquared = Vector2.DistanceSquared(from, to);
        const attackRange = this.attackRange * 1.25;
        if (distanceSquared <= attackRange * attackRange) {
            const direction = to.subtract(from);
            const directionAngle = Math.atan2(direction.y, direction.x);

            this.attack(directionAngle);
            this._freezeTime = Time.getTicks(1);
        }
    }

    private checkPatrol(): void {
        if (this._alerted) {
            return;
        }

        const enemy = this.findEnemyInRadius(25);
        if (enemy == null) {
            return;
        }

        if (this.isOnPatrolPoint()) {
            this._patrolStayTimer--;
            if (this._patrolStayTimer > 0) {
                return;
            }
        } else if (this._patrolPointIndex >= 0) {
            return;
        }

        this._patrolStayTimer = MonsterCombatComponent.PatrolStayTimer;
        this._patrolPointIndex = (this._patrolPointIndex + 1) % this._patrolPoints.length;
        this.moveToPatrolPoint();
    }

    private moveToPatrolPoint(): void {
        if (this._patrolPointIndex === -1) {
            return;
        }
        const movementComponent = this.parent.getComponent(AIMovementComponent);
        movementComponent.moveTo(this._patrolPoints[this._patrolPointIndex]);
    }

    private setTarget(target: Nullable<GameObject>): void {
        if (target === null && this._currentTarget === null) {
            return;
        }
        this._currentTarget = target;
        this._currentTargetPosition = target?.position.clone();

        const movementComponent = this.parent.getComponent(AIMovementComponent);
        if (target != null) {
            movementComponent.moveTo(this.findBestAttackPosition());
        } else {
            this._patrolStayTimer = MonsterCombatComponent.PatrolStayTimer;
            this._patrolPointIndex = this.searchClosestPatrolPointIndex();
            console.log("searchClosestPatrolPointIndex", this._patrolPointIndex);
            this.moveToPatrolPoint();
        }
    }

    private findBestAttackPosition(): Vector2 {
        const from = this._parent.position;
        const to = this._currentTargetPosition;
        const direction = to.subtract(from);
        const distance = direction.length() - this.attackRange * 0.75;
        if (distance <= 0) {
            return from;
        }
        const bestPosition = from.add(direction.normalize().scale(distance));
        // TODO: search passable position
        return bestPosition;
    }

    private get attackRange(): number {
        let maxDistance = this._config.shootRadius;
        if (this._config.projectileId) {
            const projectileSpeed = this._config.projectileSpeed;
            const projectileLifetime = this._config.projectileLifetime * 0.1;
            maxDistance += projectileSpeed * projectileLifetime;
        }
        return maxDistance;
    }

    private findEnemyInRadius(radius: number): Nullable<GameObject> {
        const radiusSquared = radius * radius;
        const enemies = this._parent.gameObjectManager.objects.values();
        let closestEnemy = null;
        let closestDistance = Number.MAX_VALUE;
        for (const enemy of enemies) {
            if (enemy.alive && enemy.team !== this._parent.team && enemy.team !== -1) {
                const distance = Vector2.DistanceSquared(enemy.position, this._parent.position);
                if (distance <= radiusSquared) {
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                }
            }
        }
        return closestEnemy;
    }

    private calculatePatrolPoints(): void {
        this._patrolPoints = [];
        this._patrolPointIndex = -1;

        const centerPatrolPoint = this._parent.position.clone();
        for (let i = 0; i < MonsterCombatComponent.NumPatrolPoints; i++) {
            const angle = Math.PI * 2 * i / MonsterCombatComponent.NumPatrolPoints;
            const radius = this._patrolRadius;
            const x = centerPatrolPoint.x + radius * Math.cos(angle);
            const y = centerPatrolPoint.y + radius * Math.sin(angle);
            const point = new Vector2(x, y);
            if (this.parent.level.isPassableTile(point)) {
                this._patrolPoints.push(point);
            }
        }

        // scramble patrol points
        for (let i = 0; i < this._patrolPoints.length; i++) {
            const j = Math.floor(Math.random() * this._patrolPoints.length);
            const temp = this._patrolPoints[i];
            this._patrolPoints[i] = this._patrolPoints[j];
            this._patrolPoints[j] = temp;
        }
    }

    private searchClosestPatrolPointIndex(): number {
        const position = this._parent.position;
        let closestDistance = Number.MAX_VALUE;
        let closestIndex = -1;
        for (let i = 0; i < this._patrolPoints.length; i++) {
            const distance = Vector2.DistanceSquared(position, this._patrolPoints[i]);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }
        return closestIndex;
    }

    private isOnPatrolPoint(): boolean {
        const position = this._parent.position;
        const targetPatrolPoint = this._patrolPoints[this._patrolPointIndex];
        const distance = Vector2.DistanceSquared(position, targetPatrolPoint);
        return distance <= 0.1;
    }
}