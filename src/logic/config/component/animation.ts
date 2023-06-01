export default interface AnimationConfig {
    idle: AnimationClipConfig;
    walk: AnimationClipConfig;
    attack: AnimationClipConfig;
    die: AnimationClipConfig;
    damage: AnimationClipConfig;
}

export interface AnimationClipConfig {
    clip: string;
    loop: boolean;
    speed: number;
    alt: string[];
}