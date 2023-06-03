import ItemConfig from "../config/item";

export default class Item {
    public config: ItemConfig;
    public count: number;

    constructor(config: ItemConfig, count: number) {
        this.config = config;
        this.count = count;
    }
}