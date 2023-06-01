import GameObject, { GameObjectType } from "./gameObject";
import Level from "../level/level";
import AnimationComponent from "./component/animation";
import ChestConfig from "../config/gameobject/chest";
import RenderComponent from "./component/render";
import {AbstractMesh, Mesh} from "@babylonjs/core";
import GenericAnimationComponent from "./component/genericAnimation";

export default class Chest extends GameObject {
    private _direction: number = 0;
    private _itemIds: number[] = [];
    private _opened: boolean = false;

    public constructor(config: ChestConfig, level: Level) {
        super(config, level);
        this.addComponent(new RenderComponent(this, config.render));
        this.addComponent(new GenericAnimationComponent(this));

        const renderComponent = this.getComponent(RenderComponent);
        renderComponent.onLoaded.add((mesh: AbstractMesh) => {
            this.updateAnimation();
        });
    }

    public get type(): GameObjectType {
        return GameObjectType.Chest;
    }

    public get direction(): number {
        return this._direction;
    }

    public set direction(value: number) {
        this._direction = value;
    }

    public load(data: any): void {
        super.load(data);
        this._direction = data.direction;
        this._itemIds = data.drops;
        this._opened = data.opened || false;
        this.updateAnimation();
    }

    public save(): any {
        let data = super.save();
        data.direction = this._direction;
        data.drops = this._itemIds;
        data.opened = this._opened;
        return data;
    }

    public open(): void {
        if (this._opened) {
            return;
        }
        this._opened = true;
        this.updateAnimation();
    }

    public updateAnimation(): void {
        const config = this.config as ChestConfig;
        const animationComponent = this.getComponent(GenericAnimationComponent);
        if (this._opened) {
            animationComponent.play(config.openingAnimation).onAnimationGroupEndObservable.add(() => {
                animationComponent.play(config.openedAnimation);
            });
        } else {
            animationComponent.play(config.closedAnimation);
        }
    }
}