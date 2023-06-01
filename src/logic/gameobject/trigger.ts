import GameObject, { GameObjectType } from "./gameObject";
import Level from "../level/level";
import Config from "../config/config";
import {EventList} from "../util/eventList";

export default class Trigger extends GameObject {
    private _triggered: boolean;
    private _area: {
        xMin: number,
        xMax: number,
        yMin: number,
        yMax: number
    }
    private _autoReset: boolean;

    public onTrigger: EventList = new EventList();
    public onReset: EventList = new EventList();

    public constructor(config: Config, level: Level) {
        super(config, level);
    }

    public get type(): GameObjectType {
        return GameObjectType.Trigger;
    }
    
    public update(): void {
        super.update();
        if (this._triggered && !this._autoReset) {
            return;
        }

        let isInside = false;
        const objects = this.gameObjectManager.objects.values();
        for (const object of objects) {
            if (object.type == GameObjectType.Character) {
                const position = object.position;
                if (position.x >= this._area.xMin && position.x <= this._area.xMax && position.y >= this._area.yMin && position.y <= this._area.yMax) {
                    isInside = true;
                    break;
                }
            }
        }

        if (isInside == this._triggered) {
            return;
        }

        this._triggered = isInside;
        if (this._triggered) {
            this.onTrigger.trigger();
        } else {
            this.onReset.trigger();
        }
    }

    public load(data: any): void {
        super.load(data);
        this._triggered = data.triggered || false;
        this._area = {
            xMin: data.area[0],
            yMin: data.area[1],
            xMax: data.area[2],
            yMax: data.area[3]
        };
        this._autoReset = data.autoReset || false;
    }

    public save(): any {
        let data = super.save();
        data.triggered = this._triggered;
        data.area = [this._area.xMin, this._area.yMin, this._area.xMax, this._area.yMax];
        data.autoReset = this._autoReset;
        return data;
    }

    public get triggered(): boolean {
        return this._triggered;
    }
}