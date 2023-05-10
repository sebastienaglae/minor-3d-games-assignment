import { AnimationGroup } from "@babylonjs/core";
import GameObject from "../gameObject";
import Component, { ComponentType } from "./component";
import MovementComponent from "./movement";
import MonsterMovementComponent from "./monsterMovement";
import AnimationConfig, { AnimationClipConfig } from "../../config/component/animation";
import HitpointComponent from "./hitpoint";

export default class AnimationComponent extends Component {
    private _groups: { [name: string]: AnimationGroup } = {};
    private _currentGroup: AnimationGroup;

    private _config: AnimationConfig;

    constructor(parent: GameObject, config: AnimationConfig = null) {
        super(parent);
        this._config = config;

        const movementComponent = this.parent.findComponent(MovementComponent) ?? this.parent.findComponent(MonsterMovementComponent);
        if (movementComponent) {
            movementComponent.onMove = (rate) => {
                if (rate < 0.1) {
                    this.play("idle");
                } else {
                    this.play("walk", rate);
                }
            };
        }

        const hitpointComponent = this.parent.findComponent(HitpointComponent);
        if (hitpointComponent) {
            hitpointComponent.onDeath = () => {
                this.play("die");
            };
            hitpointComponent.onDamage = () => {
                this.play("damage");
            }
        }
    }

    private _loadAnimation(clip: AnimationClipConfig, speed: number = 1, stopCurrent: boolean = true): void {
        const group = this._groups[clip.clip];
        if (!group) {
          console.warn(`Animation group ${clip.clip} not found`);
          return null;
        }

        group.speedRatio = speed * clip.speed;

        if (group === this._currentGroup) {
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

    public play(name: string, speed = 1, stopCurrent: boolean = true): void {
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

        this._loadAnimation(clip, speed, stopCurrent);
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