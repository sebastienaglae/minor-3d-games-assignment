import { AnimationGroup } from "@babylonjs/core";
import GameObject from "../gameObject";
import Component, { ComponentType } from "./component";
import MovementComponent from "./movement";
import AIMovementComponent from "./aiMovement";
import AnimationConfig, { AnimationClipConfig } from "../../config/component/animation";
import HitpointComponent from "./hitpoint";
import RenderComponent from "./render";
import CombatComponent from "./combat";
import MonsterCombatComponent from "./monsterCombat";

export default class AnimationComponent extends Component {
    private _groups: { [name: string]: AnimationGroup } = {};
    private _currentGroup: AnimationGroup;
    private _currentType: string;

    private _config: AnimationConfig;

    constructor(parent: GameObject, config: AnimationConfig = null) {
        super(parent);
        this._config = config;

        const combatComponent = this.parent.findComponent(CombatComponent) ?? this.parent.findComponent(MonsterCombatComponent);
        const movementComponent = this.parent.findComponent(MovementComponent) ?? this.parent.findComponent(AIMovementComponent);
        if (movementComponent) {
            movementComponent.onMove.add(rate => {
                if (this._currentGroup && this._currentGroup.isPlaying) {
                    if (this._currentType === "walk" || this._currentType === "idle" || this._currentType === "damage") {
                        // ok
                    } else if (this._currentType === "attack" && (combatComponent === null || combatComponent.canAttackWhileMoving) && rate >= 0.25) {
                        // ok
                    } else {
                        return;
                    }
                }

                if (rate < 0.25) {
                    this.play("idle");
                } else {
                    this.play("walk", rate);
                }
            });
        }

        if (combatComponent) {
            combatComponent.onPrepareAttack.add(() => {
                this.play("attack");
            });
        }

        const hitpointComponent = this.parent.findComponent(HitpointComponent);
        if (hitpointComponent) {
            hitpointComponent.onDeath.add(() => {
                this.play("die");
            });
            hitpointComponent.onDamage.add(() => {
                this.play("damage");
            });
        }

        const renderComponent = this.parent.findComponent(RenderComponent);
        if (renderComponent) {
            renderComponent.onLoaded.add(() => {
                this.play("idle", 1, true, false);
            });
        }
    }

    private _loadAnimation(clip: AnimationClipConfig, speed: number = 1, stopCurrent: boolean = true, randomize = true): void {
        let clipName = clip.clip;
        if (clip.alt && clip.alt.length > 0 && randomize) {
            const rand = Math.random() * (clip.alt.length + 1);
            if (rand < clip.alt.length) {
                clipName = clip.alt[Math.floor(rand)];
            }
        }

        const group = this._groups[clipName];
        if (!group) {
          console.warn(`Animation group ${clipName} not found`);
          return null;
        }

        group.speedRatio = speed * clip.speed;

        if (group === this._currentGroup && group.isPlaying) {
            return;
        }

        group.play(clip.loop);
    
        if (stopCurrent) {
            if (this._currentGroup) {
                this._currentGroup.stop();
            }
        }

        this._currentGroup = group;
    }

    public play(name: string, speed = 1, stopCurrent: boolean = true, randomize = true): void {
        let clip: AnimationClipConfig;
        switch (name) {
            case "idle":
                clip = this._config.idle;
                break;
            case "walk":
                clip = this._config.walk;
                break;
            case "attack":
                clip = this._config.attack;
                break;
            case "die":
                clip = this._config.die;
                break;
            case "damage":
                clip = this._config.damage;
                break;
            default:
                console.warn(`Unknown animation clip ${name}`);
                return;
        }

        this._loadAnimation(clip, speed, stopCurrent, randomize);
        this._currentType = name;
    }

    public get type(): ComponentType {
        return ComponentType.Animation;
    }
    
    public update(): void {
        
    }

    public setGroups(groups: AnimationGroup[]): void {
        groups.forEach((group) => {
            this._groups[group.name] = group;
        });
    }
}