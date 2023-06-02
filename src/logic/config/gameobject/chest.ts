import Config from "../config";
import RenderConfig from "../component/render";
import {AnimationClipConfig} from "../component/animation";

export default interface ChestConfig extends Config {
    render: RenderConfig;
    openingAnimation: AnimationClipConfig;
    openedAnimation: AnimationClipConfig;
    closedAnimation: AnimationClipConfig;
    audioId: number;
}