import * as configsJson from '../../assets/configs.json';
import CharacterConfig from './gameobject/character';
import MonsterConfig from './gameobject/monster';
import ProjectileConfig from './gameobject/projectile';

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

    public static getCharacter(id: number): CharacterConfig {
        return configsJson.characters.find((character: CharacterConfig) => character.id === id);
    }

    public static getMonster(id: number): MonsterConfig {
        return configsJson.monsters.find((monster: MonsterConfig) => monster.id === id);
    }

    public static getProjectile(id: number): ProjectileConfig {
        return configsJson.projectiles.find((projectile: ProjectileConfig) => projectile.id === id);
    }
}