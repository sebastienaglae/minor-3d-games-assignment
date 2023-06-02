import Component, {ComponentType} from "./component";
import {AnimationClipConfig} from "../../config/component/animation";
import {AnimationGroup} from "@babylonjs/core";
import GameObject from "../gameObject";

export default class GenericAnimationComponent extends Component {
    protected readonly _groups: { [name: string]: AnimationGroup } = {};

    constructor(parent: GameObject) {
        super(parent);
    }

    get type(): ComponentType {
        return ComponentType.GenericAnimation;
    }

    public play(config: AnimationClipConfig): AnimationGroup | null {
        const group = this._groups[config.clip];
        if (!group) {
            console.warn(`Animation group ${config.clip} not found`);
            return null;
        }

        group.speedRatio = config.speed;
        group.play(config.loop);

        return group;
    }

    update(): void {

    }

    public setGroups(groups: AnimationGroup[]): void {
        groups.forEach((group) => {
            this._groups[group.name] = group;
        });
    }
}