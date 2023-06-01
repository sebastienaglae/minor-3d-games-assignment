import Level from "../level/level";
import Mission from "./mission";
import MissionConfig from "../config/mission";
import ConfigTable from "../config/table";

export default class MissionManager {
    private readonly _level: Level;
    private readonly _completedMissions: MissionConfig[];

    private _currentMission: Mission | null;

    constructor(level: Level) {
        this._level = level;
        this._currentMission = null;
        this._completedMissions = [];
    }

    public update() {
        if (this._currentMission === null || this._currentMission.isCompleted) {
            if (this._currentMission) {
                this._completedMissions.push(this._currentMission.config);
            }
            this._currentMission = this.searchOpenMission();
            this._currentMission?.start();
        } else {
            this._currentMission.update();
        }
    }

    public get currentMission(): Mission | null {
        return this._currentMission;
    }

    public isMissionCompleted(mission: MissionConfig): boolean {
        return this._completedMissions.includes(mission);
    }

    private searchOpenMission() {
        for (const missionConfig of ConfigTable.missions) {
            if (missionConfig.sceneId !== this._level.id) {
                continue;
            }
            if (this.isMissionCompleted(missionConfig)) {
                continue;
            }
            if (missionConfig.dependencyIds.some(id => !this.isMissionCompleted(ConfigTable.getMission(id)))) {
                continue;
            }
            return new Mission(missionConfig, this._level);
        }
        return null;
    }

    public getCompletedMissionsInGroup(group: number): MissionConfig[] {
        const missions = ConfigTable.missions.filter(mission => mission.groupId === group);
        return missions.filter(mission => this.isMissionCompleted(mission));
    }

    public getTotalMissionsInGroup(group: number): number {
        return ConfigTable.missions.filter(mission => mission.groupId === group).length;
    }
}