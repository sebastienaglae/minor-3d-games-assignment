import Config from "./config";

export default interface ItemConfig extends Config {
    title: string;
    description: string;
    icon: string;
    category: ItemCategory;
}

export enum ItemCategory {
    Weapon,
    Armor,
    Consumable,
    Misc
}