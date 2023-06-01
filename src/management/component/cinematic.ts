import ISceneComponent from "./interface";
import Scene from "../../scenes/scene";
import MissionManager from "../../logic/mission/manager";
import {AnimationGroup, FreeCamera} from "@babylonjs/core";
import PlayerCamera from "./playerCamera";
import DialogComponent from "./dialog";
import Level from "../../logic/level/level";
import RenderComponent from "../../logic/gameobject/component/render";

export default class CinematicComponent implements ISceneComponent {
    private readonly _scene: Scene;
    private readonly _level: Level;
    private readonly _missionManager: MissionManager;

    private _currentCinematic: AnimationGroup | null = null;

    private _playerCamera: PlayerCamera;
    private _cinematicCamera: FreeCamera;

    private _dialogComponent: DialogComponent;

    private _animationPlaySeconds: number = 0;
    private _animationRemainingSeconds: number = 0;

    private _fadeIn: number = 0;
    private _canvasCurrentFadeIn: number = 1;

    constructor(scene: Scene, cinematicCamera: FreeCamera, level: Level) {
        this._scene = scene;
        this._level = level;
        this._missionManager = level.missionManager;
        this._playerCamera = scene.getComponent(PlayerCamera);
        this._cinematicCamera = cinematicCamera;
        this._dialogComponent = scene.getComponent(DialogComponent);

        // this._createDebugMenu();
    }

    update(): void {
        if (this._currentCinematic) {
            this._updatePlayingCinematic();
        }
        if (this._currentCinematic === null) {
            const mission = this._missionManager.currentMission;
            if (mission && !mission.isCompleted) {
                const config = mission.config;
                if (config.cinematic && config.cinematic != "") {
                    if (!this._playCinematic(config.cinematic)) {
                        mission.complete();
                    }
                }
            }
        }
        if (this._currentCinematic === null) {
            this._fadeIn = Math.min(1, this._fadeIn + (this._scene.getEngine().getDeltaTime() / 1000));
        }

        this._updateFadeInFadeOut();
    }

    destroy(): void {
    }

    private _playCinematic(name: string): boolean {
        console.log('Playing cinematic: ' + name);

        this._currentCinematic = this._scene.getAnimationGroupByName(name);
        if (!this._currentCinematic) {
            console.error('Cinematic not found: ' + name);
            return false;
        }

        if (name == "Cinematic_Intro") {
            const player = this._level.gameObjectManager.player;
            if (player) {
                player.getComponent(RenderComponent).hide();
            }
        }

        this._playerCamera.camera.setEnabled(false);
        this._cinematicCamera.setEnabled(true);
        this._scene.activeCamera = this._cinematicCamera;

        this._currentCinematic.play();

        return true;
    }

    private _updatePlayingCinematic(): void {
        if (this._currentCinematic) {
            if (!this._currentCinematic.isPlaying) {
                this._stopCinematic();
                this._missionManager.currentMission?.complete();
            } else {
                const toFrame = this._currentCinematic.to;
                let currentFrame = 0xffffffff;
                for (const animatable of this._currentCinematic.targetedAnimations) {
                    for (const animation of animatable.animation.runtimeAnimations) {
                        const frame = animation.currentFrame;
                        if (frame < currentFrame) {
                            currentFrame = frame;
                        }
                    }
                }

                const remainingFrames = toFrame - currentFrame;
                const remainingTime = remainingFrames / 60;

                if (remainingTime < 1 && !this._dialogComponent.isCompleted) {
                    this._currentCinematic.goToFrame(toFrame - 60);
                    return;
                }

                this._animationRemainingSeconds = remainingTime;
                this._animationPlaySeconds = toFrame / 60;
                this._fadeIn = Math.min(1, remainingTime);
            }
        }
    }

    private _stopCinematic(): void {
        if (this._currentCinematic) {
            if (this._currentCinematic.name == "Cinematic_Intro") {
                const player = this._level.gameObjectManager.player;
                if (player) {
                    player.getComponent(RenderComponent).show();
                }
            }

            this._currentCinematic.stop();
            this._currentCinematic = null;
            this._cinematicCamera.setEnabled(false);
            this._playerCamera.camera.setEnabled(true);
            this._scene.activeCamera = this._playerCamera.camera;
            this._fadeIn = 0;
        }
    }

    private _createDebugMenu() {
        const cinematics = [];
        for (const group of this._scene.animationGroups) {
            console.log(group.name);
            if (group.name.toLowerCase().startsWith('cinematic')) {
                cinematics.push(group);
            }
        }

        // create a html select element
        const select = document.createElement('select');
        select.style.position = 'absolute';
        select.style.top = '0';
        select.style.left = '0';
        select.style.zIndex = '100';
        select.style.color = 'white';
        select.style.backgroundColor = 'black';
        select.style.border = 'none';
        select.style.padding = '5px';
        select.style.fontFamily = 'monospace';

        // create a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'None';
        select.appendChild(defaultOption);

        // create an option for each cinematic
        for (const cinematic of cinematics) {
            const option = document.createElement('option');
            option.value = cinematic.name;
            option.text = cinematic.name;
            select.appendChild(option);
        }

        // add the select to the document
        document.body.appendChild(select);

        // add an event listener to the select
        select.addEventListener('change', () => {
            const value = select.value;
            if (value === '') {
                this._stopCinematic();
            } else {
                this._playCinematic(value);
            }
        });
    }

    private _updateFadeInFadeOut() {
        if (this._fadeIn != this._canvasCurrentFadeIn) {
            const canvas = this._scene.getEngine().getRenderingCanvas();
            if (canvas) {
                const opacity = Math.min(1, Math.max(0, this._fadeIn));
                canvas.style.opacity = opacity.toString();
                this._canvasCurrentFadeIn = opacity;
            }
        }
    }

    public get playingCinematic(): boolean {
        return this._currentCinematic != null;
    }
}