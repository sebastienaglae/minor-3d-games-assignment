import * as configsJson from '../../assets/configs.json';
import CharacterConfig from './gameobject/character';
import MonsterConfig from './gameobject/monster';
import ProjectileConfig from './gameobject/projectile';
import Globals from './globals';
import SceneConfig from './scene';
import MissionConfig from "./mission";
import NpcConfig from "./gameobject/npc";
import AudioConfig from "./audio";

export default class ConfigTable {
    public static get characters(): CharacterConfig[] {
        return configsJson.characters;
    }
    public static get monsters(): MonsterConfig[] {
        return configsJson.monsters;
    }
    public static get projectiles(): ProjectileConfig[] {
        return configsJson.projectiles;
    }
    public static get scenes(): SceneConfig[] {
        return configsJson.scenes;
    }
    public static get npcs(): NpcConfig[] {
        return configsJson.npcs;
    }
    public static get audios(): AudioConfig[] {
        return configsJson.audios;
    }

    public static get globals(): Globals {
        return configsJson.globals;
    }

    public static get missions(): MissionConfig[] {
        return configsJson.missions;
    }

    public static getCharacter(id: number): CharacterConfig {
        return configsJson.characters.find((character: CharacterConfig) => character.id === id);
    }

    public static getMonster(id: number): MonsterConfig {
        return configsJson.monsters.find((monster: MonsterConfig) => monster.id === id);
    }

    public static getNpc(id: number): NpcConfig {
        return configsJson.npcs.find((npc: NpcConfig) => npc.id === id);
    }

    public static getProjectile(id: number): ProjectileConfig {
        return configsJson.projectiles.find((projectile: ProjectileConfig) => projectile.id === id);
    }

    public static getScene(id: number): SceneConfig {
        return configsJson.scenes.find((scene: SceneConfig) => scene.id === id);
    }

    public static getMission(id: number): MissionConfig {
        return configsJson.missions.find((mission: MissionConfig) => mission.id === id);
    }
}