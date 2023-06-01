import ISceneComponent from "./interface";
import Level from "../../logic/level/level";
import Scene from "../../scenes/scene";
import MissionManager from "../../logic/mission/manager";
import {Dialogue} from "../../space/ui/Dialogue";
import Mission from "../../logic/mission/mission";

export default class DialogComponent implements ISceneComponent {
    private _missionManager: MissionManager;
    private _currentMission: Mission | null = null;
    private _manager: Dialogue;

    constructor(scene: Scene, level: Level) {
        this._missionManager = level.missionManager;
        this._manager = Dialogue.getInstance();

        this._manager.clear();
        this._manager.clearDialogues();
        this._manager.isLooping = false;
    }

    destroy(): void {
    }

    update(t: number): void {
        this._manager.update(t);

        const currentMission = this._missionManager.currentMission;
        if (currentMission != this._currentMission) {
            this._currentMission = currentMission;
            this._manager.clear();
            if (currentMission != null) {
                for (const dialog of currentMission.config.dialogs) {
                    const duration = dialog.delay != 0 ? dialog.delay : dialog.text.length * 0.075 + 2;
                    this._manager.addText(dialog.text, duration);
                }
            }
        }
    }

    public get isCompleted(): boolean {
        return this._manager.isCompleted;
    }
}