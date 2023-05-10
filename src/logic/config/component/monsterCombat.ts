import CombatConfig from "./combat";

export default interface MonsterCombatConfig extends CombatConfig {
    alertInRadius: number;
    alertOutRadius: number;
    patrolRadius: number;
}