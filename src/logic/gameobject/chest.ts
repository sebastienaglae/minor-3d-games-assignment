import GameObject, { GameObjectType } from "./gameObject";
import Level from "../level/level";
import ChestConfig from "../config/gameobject/chest";
import RenderComponent from "./component/render";
import {AbstractMesh, Mesh, Vector2} from "@babylonjs/core";
import GenericAnimationComponent from "./component/genericAnimation";
import {EventList} from "../util/eventList";

export default class Chest extends GameObject {
    public onOpen: EventList = new EventList();

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

    public get opened(): boolean {
        return this._opened;
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
        this.onOpen.trigger();
        this.updateAnimation();

        for (let itemId of this._itemIds) {
            this.level.dropItem(itemId, this.position);
        }
    }

    public canInteractWith(gameObject: GameObject): boolean {
        return !this._opened && gameObject.type === GameObjectType.Character && Vector2.DistanceSquared(this.position, gameObject.position) < 15;
    }

    public interactWith(gameObject: GameObject): void {
        this.open();
    }

    public updateAnimation(): void {
        const config = this.config as ChestConfig;
        const animationComponent = this.getComponent(GenericAnimationComponent);
        if (this._opened) {
            animationComponent.play(config.openingAnimation)?.onAnimationGroupEndObservable.add(() => {
                animationComponent.play(config.openedAnimation);
            });
        } else {
            animationComponent.play(config.closedAnimation);
        }
    }
}