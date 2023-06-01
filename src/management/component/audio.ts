import ISceneComponent from "./interface";
import {Sound} from "@babylonjs/core";
import AudioConfig, {AudioType} from "../../logic/config/audio";
import Level from "../../logic/level/level";
import GameObject, {GameObjectType} from "../../logic/gameobject/gameObject";
import MonsterCombatComponent from "../../logic/gameobject/component/monsterCombat";
import MonsterConfig from "../../logic/config/gameobject/monster";
import ConfigTable from "../../logic/config/table";
import Scene from "../../scenes/scene";
import Trigger from "../../logic/gameobject/trigger";
import CombatComponent from "../../logic/gameobject/component/combat";
import MovementComponent from "../../logic/gameobject/component/movement";
import AIMovementComponent from "../../logic/gameobject/component/aiMovement";

export default class AudioComponent implements ISceneComponent {
    private readonly _level: Level;
    private readonly _audios: Map<AudioConfig, Sound> = new Map<AudioConfig, Sound>();

    private _currentAudioConfig: AudioConfig | null = null;
    private _currentAudio: Sound | null = null;

    constructor(scene: Scene, level: Level) {
        this._level = level;

        const audios = ConfigTable.audios;
        for (const audioConfig of audios) {
            const sound = new Sound(audioConfig.name, "assets/" + audioConfig.audio, scene, () => {
                this._audios.set(audioConfig, sound);
            }, {
                loop: false,
                autoplay: false,
            });
        }

        this._level.gameObjectManager.onNewObject.add(this.register.bind(this));
    }

    update(): void {
        const currentAudioEnvType = this.getCurrentEnvType();
        const audioConfig = this.pickAudio(currentAudioEnvType);
        if (!audioConfig) {
            return
        }

        if (this._currentAudioConfig === null || !this._currentAudio.isPlaying || audioConfig.type !== currentAudioEnvType || audioConfig.location !== this._currentAudioConfig.location) {
            if (this._currentAudio) {
                // fade out then stop
                this._currentAudio.setVolume(0, 1);
                this._currentAudio.stop(1);
            }

            this._currentAudioConfig = null;
            this._currentAudio = null;

            if (audioConfig) {
                const audio = this._audios.get(audioConfig);
                if (audio) {
                    this._currentAudioConfig = audioConfig;
                    this._currentAudio = audio;
                    console.log("Playing audio: " + audioConfig.name);
                    audio.setVolume(audioConfig.volume, 1);
                    audio.play(0, 0);
                }
            }
        }
    }

    destroy(): void {
        for (const audio of this._audios.values()) {
            audio.dispose();
        }
    }

    getCurrentEnvType(): AudioType {
        let isAttacking = false;
        let isAttackingBoss = false;
        const gameObjects = this._level.gameObjectManager.objects;
        for (const gameObject of gameObjects.values()) {
            if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                const monster = gameObject.getComponent(MonsterCombatComponent);
                if (monster.isAlerted) {
                    isAttacking = true;
                    const monsterConfig = gameObject.config as MonsterConfig;
                    if (monsterConfig.isBoss) {
                        isAttackingBoss = true;
                    }
                }
            }
        }

        if (isAttackingBoss) {
            return AudioType.BATTLE_BOSS;
        }
        if (isAttacking) {
            return AudioType.BATTLE;
        }
        return AudioType.AMBIENT;
    }

    pickAudio(audioType: AudioType): AudioConfig | null {
        let audioConfigs = null;
        const specificAudioConfigs = ConfigTable.audios.filter((audioConfig) => audioConfig.area.length != 0 && audioConfig.type === audioType);
        if (specificAudioConfigs.length != 0) {
            const availableAudioConfigs = specificAudioConfigs.filter((audioConfig) => {
                const triggerIds = audioConfig.area;
                for (const triggerId of triggerIds) {
                    const trigger = this._level.gameObjectManager.getObject(triggerId) as Trigger;
                    if (trigger && trigger.triggered) {
                        return true;
                    }
                }
                return false;
            });
            if (availableAudioConfigs.length != 0) {
                audioConfigs = availableAudioConfigs;
            }
        }
        if (audioConfigs === null) {
            audioConfigs = ConfigTable.audios.filter((audioConfig) => audioConfig.area.length === 0 && audioConfig.type === audioType);
        }
        if (audioConfigs.length === 0) {
            return null;
        }
        return audioConfigs[Math.floor(Math.random() * audioConfigs.length)];
    }

    register(gameObject: GameObject): void {
        const playSoundState: Map<number, PlaySoundState> = new Map<number, PlaySoundState>();

        const playSound = (audioId: number) => {
            let state = playSoundState[audioId];
            if (!state) {
                const audioConfig = ConfigTable.getAudio(audioId);
                if (audioConfig) {
                    const sound = this._audios.get(audioConfig);
                    if (sound) {
                        playSoundState[audioId] = state = new PlaySoundState(sound);
                    }
                }
            }
            if (state) {
                const timeSinceLastSound = Date.now() - state.startTime;
                if (timeSinceLastSound < 500) {
                    return;
                }
                state.sound.play();
                state.startTime = Date.now();
            }
        }

        const combatComponent =
            gameObject.findComponent(CombatComponent) ??
            gameObject.findComponent(MonsterCombatComponent);
        if (combatComponent) {
            combatComponent.onAttack.add(() => {
                // TODO
            });
        }
        const movementComponent =
            gameObject.findComponent(MovementComponent) ??
            gameObject.findComponent(AIMovementComponent);
        if (movementComponent) {
            movementComponent.onMove.add(speedNormalized => {
                if (speedNormalized > 0.1) {
                    playSound(movementComponent.config.audioId);
                }
            });
        }


    }
}

class PlaySoundState {
    sound: Sound;
    startTime: number;

    constructor(sound: Sound) {
        this.sound = sound;
        this.startTime = 0;
    }
}