import ISceneComponent from "./interface";
import Mission from "../../logic/mission/mission";
import Level from "../../logic/level/level";
import Scene from "../../scenes/scene";
import {Color3, Mesh, MeshBuilder, StandardMaterial, Vector2, Vector3} from "@babylonjs/core";
import {MissionType} from "../../logic/config/mission";
import GameObject, {GameObjectType} from "../../logic/gameobject/gameObject";
import {Dialogue} from "../../space/ui/Dialogue";
import HitpointComponent from "../../logic/gameobject/component/hitpoint";
import InputManager from "../inputmanager";
import Chest from "../../logic/gameobject/chest";
import Npc from "../../logic/gameobject/npc";
import DialogComponent from "./dialog";

export default class UIComponent implements ISceneComponent {
    private readonly _scene: Scene;
    private readonly _level: Level;
    private readonly _ui: Dialogue;

    private _currentMission: Mission | null = null;
    private _currentMissionPathTime: number = 0;
    private _currentPath: Mesh | null = null;

    private _enemyLifeBars: Map<number, Mesh> = new Map<number, Mesh>();
    private _enemyLifeBarMaterial: StandardMaterial;

    private _gameEndShown: boolean = false;

    constructor(scene: Scene, level: Level) {
        this._scene = scene;
        this._level = level;
        this._ui = Dialogue.getInstance();
        this._ui.show();
        this._ui.updatePlayerImage("assets/images/main_character.png");
        this._enemyLifeBarMaterial = new StandardMaterial("enemyLifeBarMaterial", scene);
        this._enemyLifeBarMaterial.diffuseColor = Color3.Red();
        this._enemyLifeBarMaterial.specularColor = Color3.Black();

        this._level.gameObjectManager.onNewObject.add(this.register.bind(this));
        this._level.gameObjectManager.onRemoveObject.add(this.unregister.bind(this));

        this._level.onDropItem.add(item => {
           this._ui.addCollectItem(item.config.name, "assets/" + item.config.icon);
        });
    }

    destroy(): void {
        this._ui.hide();
        for (const mesh of this._enemyLifeBars.values()) {
            mesh.dispose();
        }
        this._enemyLifeBars.clear();
        if (this._currentPath) {
            this._currentPath.dispose();
            this._currentPath = null;
        }
    }

    update(t: number): void {
        const player = this._level.gameObjectManager.player;
        if (!player) {
            return;
        }

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
        } else {
            this._ui.updateQuest("No active quest", "");
            if (!this._gameEndShown) {
                this._gameEndShown = true;
                this._ui.showGameEnd();
            }
        }

        let enemiesAlive = 0;
        for (const gameObject of this._level.gameObjectManager.objects.values()) {
            if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                enemiesAlive++;
            }
        }

        this._ui.updateMonsterCount(enemiesAlive);

        let chestsFound = 0;
        let chestsTotal = 0;
        for (const gameObject of this._level.gameObjectManager.objects.values()) {
            if (gameObject.type === GameObjectType.Chest) {
                const chest = gameObject as Chest;
                if (chest.opened) {
                    chestsFound++;
                }
                chestsTotal++;
            }
        }

        this._ui.updateChestCount(chestsFound, chestsTotal);

        const hitpointComponent = player.getComponent(HitpointComponent);
        if (hitpointComponent) {
            this._ui.updateHealthBar(hitpointComponent.hitpoint / hitpointComponent.maxHitpoint * 100);
        }

        for (const gameObject of this._level.gameObjectManager.objects.values()) {
            const hitpointComponent = gameObject.findComponent(HitpointComponent);
            if (hitpointComponent !== null && hitpointComponent.team !== -1 && hitpointComponent.team !== player.team) {
                let mesh = this._enemyLifeBars.get(gameObject.id);
                if (!mesh) {
                    mesh = MeshBuilder.CreatePlane("enemyLifeBar", {width: 4, height: 0.5}, this._scene);
                    mesh.renderingGroupId = 1;
                    mesh.material = this._enemyLifeBarMaterial;

                    this._enemyLifeBars.set(gameObject.id, mesh);
                    hitpointComponent.onDeath.add(() => {
                        mesh?.dispose();
                        this._enemyLifeBars.delete(gameObject.id);
                    });
                }

                if (hitpointComponent.hitpoint === hitpointComponent.maxHitpoint) {
                    mesh.isVisible = false;
                    continue;
                }

                mesh.isVisible = true;
                mesh.scaling.x = hitpointComponent.hitpoint / hitpointComponent.maxHitpoint;
                mesh.position.set(gameObject.position.x - mesh.scaling.x / 2, 5, gameObject.position.y);
                mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
            }
        }

        const interactableObjects = [];
        for (const gameObject of this._level.gameObjectManager.objects.values()) {
            if (gameObject.canInteractWith(player)) {
                interactableObjects.push(gameObject);
            }
        }
        if (interactableObjects.length > 0) {
            this._ui.updateHint("Presser F pour interagir");
        } else {
            this._ui.updateHint("");
        }

        if (InputManager.isKeyDown("f", true)) {
            let minDistance = Number.MAX_VALUE;
            let minDistanceObject = null;
            for (const gameObject of interactableObjects) {
                const distance = Vector2.DistanceSquared(gameObject.position, player.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    minDistanceObject = gameObject;
                }
            }
            if (minDistanceObject) {
                minDistanceObject.interactWith(player);
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
                    let minDistance = Number.MAX_VALUE;
                    let minDistanceMonster = null;
                    for (const gameObject of this._level.gameObjectManager.objects.values()) {
                        if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                            const distance = Vector2.DistanceSquared(gameObject.position, monster.position);
                            if (distance < minDistance) {
                                minDistance = distance;
                                minDistanceMonster = gameObject;
                            }
                        }
                    }

                    if (!minDistanceMonster) {
                        return;
                    }

                    position.set(minDistanceMonster.position.x, minDistanceMonster.position.y);
                }
                break;
            case MissionType.KILL_ANY_MONSTER:
                let minDistance = Number.MAX_VALUE;
                let minDistanceMonster = null;
                for (const gameObject of this._level.gameObjectManager.objects.values()) {
                    if (gameObject.type === GameObjectType.Monster && gameObject.alive) {
                        const distance = Vector2.DistanceSquared(gameObject.position, position);
                        if (distance < minDistance) {
                            minDistance = distance;
                            minDistanceMonster = gameObject;
                        }
                    }
                }
                if (!minDistanceMonster) {
                    return;
                }

                position.set(minDistanceMonster.position.x, minDistanceMonster.position.y);
                break;
            case MissionType.TRIGGER:
                const triggerIds = mission.config.triggerIds;
                const triggerObjects = triggerIds.filter(id => this._level.gameObjectManager.getObject(id));
                if (triggerObjects.length > 0) {
                    const trigger = this._level.gameObjectManager.getObject(triggerObjects[0]);
                    position.set(trigger.position.x, trigger.position.y);
                }
                break;
            default:
                return;
        }

        const player = this._level.gameObjectManager.player;
        if (!player || Vector2.DistanceSquared(player.position, position) < 1.5) {
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

    private register(gameObject: GameObject) {
        if (gameObject.type === GameObjectType.Npc) {
            (gameObject as Npc).onInteract.add(this._onTalkToNpc);
        }
    }

    private unregister(gameObject: GameObject) {
        if (gameObject.type === GameObjectType.Npc) {
            (gameObject as Npc).onInteract.remove(this._onTalkToNpc);
        }
    }

    private _onTalkToNpc = (npc: Npc) => {
        const mission = this._currentMission;
        if (mission) {
            const config = mission.config;
            const npcId = config.npcId;
            if (npcId === npc.id && config.npcDialogOverride) {
                this._scene.getComponent(DialogComponent).showDialogGroup(config.npcDialogOverride);
            }
        }
    }
}