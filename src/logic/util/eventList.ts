export class EventList {
    private readonly _events: (() => void)[];

    constructor() {
        this._events = [];
    }

    public add(event: () => void) {
        this._events.push(event);
    }

    public remove(event: () => void) {
        const index = this._events.indexOf(event);
        if (index >= 0) {
            this._events.splice(index, 1);
        }
    }

    public clear() {
        this._events.length = 0;
    }

    public trigger() {
        for (const event of this._events) {
            event();
        }
    }
}

// Now generate with one parameter:
export class EventListT<T> {
    private readonly _events: ((arg: T) => void)[];

    constructor() {
        this._events = [];
    }

    public add(event: (arg: T) => void) {
        this._events.push(event);
    }

    public remove(event: (arg: T) => void) {
        const index = this._events.indexOf(event);
        if (index >= 0) {
            this._events.splice(index, 1);
        }
    }

    public clear() {
        this._events.length = 0;
    }

    public trigger(arg: T) {
        for (const event of this._events) {
            event(arg);
        }
    }
}