import ISceneComponent from "./interface";
import Mission from "../../logic/mission/mission";
import Level from "../../logic/level/level";
import Scene from "../../scenes/scene";
import {Color3, LinesMesh, Mesh, MeshBuilder, Vector2, Vector3} from "@babylonjs/core";
import {MissionType} from "../../logic/config/mission";
import {GameObjectType} from "../../logic/gameobject/gameObject";
import {Dialogue} from "../../space/ui/Dialogue";
import HitpointComponent from "../../logic/gameobject/component/hitpoint";

export default class UIComponent implements ISceneComponent {
    private readonly _scene: Scene;
    private readonly _level: Level;
    private readonly _ui: Dialogue;

    private _currentMission: Mission | null = null;
    private _currentMissionPathTime: number = 0;
    private _currentPath: Mesh | null = null;

    private _enemyLifeBars: Map<number, Mesh> = new Map<number, Mesh>();

    constructor(scene: Scene, level: Level) {
        this._scene = scene;
        this._level = level;
        this._ui = Dialogue.getInstance();
        this._ui.show();
        this._ui.updatePlayerImage("assets/images/main_character.png");
    }

    destroy(): void {
    }

    update(t: number): void {
        const currentMission = this._level.missionManager.currentMission;
        if (currentMission) {
            if (this._currentMission !== currentMission) {
                this._currentMission = currentMission;
                this._currentMissionPathTime = 0;
            }
            this._currentMissionPathTime -= t;
            if (this._currentMissionPathTime <= 0) {
                this._updateMissionPath();
                this._currentMissionPathTime = 1;
            }

            this._ui.updateQuest(currentMission.config.title, currentMission.config.description
                .replace("%progress%", currentMission.progress.toString())
                .replace("%total%", currentMission.requiredProgress.toString()));
        }

        let enemiesAlive = 0;
        for (const gameObject of this._level.gameObjectManager.objects.values()) {
            if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                enemiesAlive++;
            }
        }

        this._ui.updateMonsterCount(enemiesAlive);

        const player = this._level.gameObjectManager.player;
        if (player) {
            const hitpointComponent = player.getComponent(HitpointComponent);
            if (hitpointComponent) {
                this._ui.updateHealthBar(hitpointComponent.hitpoint / hitpointComponent.maxHitpoint * 100);
            }
        }

        const gameObjects = this._level.gameObjectManager.objects.values();
        for (const gameObject of gameObjects) {
            const hitpointComponent = gameObject.findComponent(HitpointComponent);
            if (hitpointComponent !== null && hitpointComponent.team !== -1 && hitpointComponent.team !== player.team) {
                let mesh = this._enemyLifeBars.get(gameObject.id);
                if (!mesh) {
                    mesh = MeshBuilder.CreatePlane("enemyLifeBar", {width: 4, height: 0.5}, this._scene);
                    this._enemyLifeBars.set(gameObject.id, mesh);
                    hitpointComponent.onDeath.add(() => {
                        mesh?.dispose();
                        this._enemyLifeBars.delete(gameObject.id);
                    });
                }
                mesh.position = new Vector3(gameObject.position.x, 5, gameObject.position.y);
                mesh.scaling = new Vector3(hitpointComponent.hitpoint / hitpointComponent.maxHitpoint, 1, 1);
                mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;

                // always face the camera
                const camera = this._scene.activeCamera;
                if (camera) {
                    mesh.lookAt(camera.position);
                    mesh.rotate(new Vector3(0, 1, 0), Math.PI);
                }
            }
        }
    }

    private _updateMissionPath(): void {
        if (this._currentPath) {
            this._currentPath.dispose();
            this._currentPath = null;
        }
        if (!this._currentMission) {
            return;
        }
        const mission = this._currentMission;
        const position = new Vector2(0, 0);
        switch (mission.config.type) {
            case MissionType.FOLLOW_NPC:
            case MissionType.TALK_TO_NPC:
                const npc = mission.npc;
                position.set(npc.position.x, npc.position.y);
                break;
            case MissionType.KILL_MONSTERS:
                const monsterIds = mission.config.monsterIds;
                const monstersAlive = monsterIds.filter(id => this._level.gameObjectManager.getObject(id));
                if (monstersAlive.length > 0) {
                    const monster = this._level.gameObjectManager.getObject(monstersAlive[0]);
                    position.set(monster.position.x, monster.position.y);
                }
                break;
            case MissionType.KILL_ANY_MONSTER:
                const monsters = [];
                for (const gameObject of this._level.gameObjectManager.objects.values()) {
                    if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                        monsters.push(gameObject);
                    }
                }
                if (monsters.length > 0) {
                    const monster = monsters[0];
                    position.set(monster.position.x, monster.position.y);
                }
                break;
            case MissionType.TRIGGER:
                const triggerIds = mission.config.triggerIds;
                const triggersAlive = triggerIds.filter(id => this._level.gameObjectManager.getObject(id));
                if (triggersAlive.length > 0) {
                    const trigger = this._level.gameObjectManager.getObject(triggersAlive[0]);
                    position.set(trigger.position.x, trigger.position.y);
                }
                break;
            default:
                return;
        }

        const player = this._level.gameObjectManager.player;
        if (!player || Vector2.DistanceSquared(player.position, position) < 1) {
            return;
        }

        const pathFinder = this._level.tileMap.pathFinder;
        const path = pathFinder.findPath(player.position, position);
        if (!path) {
            return;
        }

        // create a line mesh
        const path3D = path.map(p => new Vector3(p.x, 1, p.y));
        const mesh = MeshBuilder.CreateLines("path", {points: path3D}, this._scene);
        mesh.color = new Color3(1, 0, 0);
        mesh.isPickable = false;

        this._currentPath = mesh;
    }
}