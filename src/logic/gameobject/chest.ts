import GameObject, { GameObjectType } from "./gameObject";
import Level from "../level/level";

export default class Chest extends GameObject {
    private _itemIds: number[] = [];
    private _opened: boolean = false;

    public constructor(config: any, level: Level) {
        super(config, level);
    }

    public get type(): GameObjectType {
        return GameObjectType.Chest;
    }

    public load(data: any): void {
        super.load(data);
        this._itemIds = data.drops;
        this._opened = data.opened || false;
    }

    public save(): any {
        let data = super.save();
        data.drops = this._itemIds;
        data.opened = this._opened;
        return data;
    }
}