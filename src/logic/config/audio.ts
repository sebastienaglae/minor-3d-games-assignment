import Config from "./config";

export default interface AudioConfig extends Config {
    type: AudioType;
    location: AudioLocation;
    volume: number;
    loop: boolean;
    audio: string;
    area: number[];
}

export enum AudioType {
    AMBIENT = 0,
    BATTLE = 1,
    BATTLE_BOSS
}

export enum AudioLocation {
    GLOBAL = 0,
    LOCAL = 1,
}