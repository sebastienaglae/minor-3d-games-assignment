import AnimationConfig from "../component/animation";
import CombatConfig from "../component/combat";
import HitpointConfig from "../component/hitpoint";
import MovementConfig from "../component/movement";
import RenderConfig from "../component/render";
import Config from "../config";

export default interface CharacterConfig extends Config {
    movement: MovementConfig;
    render: RenderConfig;
    animation: AnimationConfig;
    combat: CombatConfig;
    hitpoint: HitpointConfig;
}