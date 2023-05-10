export default class Time {
    public static readonly TICKS_PER_SECOND: number = 60;
    public static readonly TICK_DELTA_TIME: number = 1 / Time.TICKS_PER_SECOND;

    private _tickNumber: number;
    private _startTimestamp: number;

    constructor() {
        this._tickNumber = 0;
        this._startTimestamp = 0;
    }

    public get tick(): number {
        return this._tickNumber;
    }

    public get timestamp(): number {
        return this._startTimestamp + Math.floor(this._tickNumber / Time.TICKS_PER_SECOND);
    }

    public static getTicks(seconds: number): number {
        return Math.floor(seconds * Time.TICKS_PER_SECOND);
    }

    public static getSeconds(ticks: number): number {
        return ticks / Time.TICKS_PER_SECOND;
    }
}