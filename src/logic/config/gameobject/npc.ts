import AnimationConfig from "../component/animation";
import RenderConfig from "../component/render";
import Config from "../config";

export default interface NpcConfig extends Config {
    render: RenderConfig;
    animation: AnimationConfig;
}