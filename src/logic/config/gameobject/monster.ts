import AnimationConfig from "../component/animation";
import HitpointConfig from "../component/hitpoint";
import MonsterCombatConfig from "../component/monsterCombat";
import MovementConfig from "../component/movement";
import RenderConfig from "../component/render";
import Config from "../config";

export default interface MonsterConfig extends Config {
    movement: MovementConfig;
    combat: MonsterCombatConfig;
    render: RenderConfig;
    animation: AnimationConfig;
    hitpoint: HitpointConfig;
    isBoss: boolean;
}