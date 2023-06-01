import Config from "./config";

export default interface MissionConfig extends Config {
    dependencyIds: number[];
    groupId: number;
    sceneId: number;
    type: MissionType;
    dialogs: Dialog[];
    tpPoint: number;

    // UI - HUD
    title: string;
    description: string;

    // Generic params
    cinematic: string;
    video: string;

    // Params if type === MissionType.TRIGGER
    triggerIds: number[];

    // Params if type === MissionType.KILL_MONSTERS
    monsterIds: number[];

    // Params if type === MissionType.KILL_ANY_MONSTERS
    monsterCount: number;

    // Params if type === MissionType.TALK_TO_NPC
    npcId: number;
    npcFirstDialog: string;
    npcGenericDialog: string;

    // Params if type === MissionType.FOLLOW_NPC
    npcMovePointIds: number[];
}

export enum MissionType {
    DUMMY = 0,
    TRIGGER = 1,
    KILL_MONSTERS = 2,
    KILL_ANY_MONSTER = 3,
    TALK_TO_NPC = 4,
    FOLLOW_NPC = 5
}

export interface Dialog {
    text: string;
    delay: number | null;
}
