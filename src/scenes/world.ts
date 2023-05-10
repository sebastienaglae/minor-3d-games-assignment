import { FlyCamera, HemisphericLight, Mesh, MeshBuilder, Ray, SceneLoader, Space, StandardMaterial, Vector2, Vector3 } from "@babylonjs/core";
import { Engine } from "@babylonjs/core/Engines/engine";
import Character from "../logic/gameobject/character";
import { GameObjectType } from "../logic/gameobject/gameObject";
import Level from "../logic/level/level";
import Time from "../logic/time/time";
import PlayerCamera from "../management/component/playerCamera";
import PlayerInput from "../management/component/playerInput";
import TerrainComponent from "../management/component/terrain";
import Scene from "./scene";
import Monster from "../logic/gameobject/monster";
import MonsterMovementComponent from "../logic/gameobject/component/monsterMovement";
import SpaceScene from "./space";
import { Dialogue } from "../space/ui/Dialogue";

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 15;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 1500, -2000);

    private static readonly WORLD_PRECISION: number = 4;
    private static readonly WORLD_SIZE: Vector2 = new Vector2(100, 100);
    private static readonly WORLD_CENTER_3D: Vector3 = new Vector3(WorldScene.WORLD_SIZE.x / 2, 0, WorldScene.WORLD_SIZE.y / 2);

    private _level: Level;
    private _logicTime: number = 0;
    private _initialized: boolean = false;

    private _dialogue: Dialogue;

    constructor(engine: Engine) {
        super(engine);
        this._level = new Level(WorldScene.WORLD_SIZE, WorldScene.WORLD_PRECISION);
        this.onDispose = () => {
            this._level.destroy();
        };
    }

    public get level(): Level {
        return this._level;
    }

    public async init(): Promise<void> {
        await super.init();

        this._level.load({
            objects: [
                {
                    type: GameObjectType.Character,
                    config: 1,
                    id: 1,
                    position: new Vector2(50, 50),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(60, 60),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(40, 40),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(35, 25),
                    direction: 0
                },
                // top slime group
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(35, 75),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(33, 73),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(37, 75),
                    direction: 0
                },
                {
                    type: GameObjectType.Monster,
                    config: 1,
                    id: -1,
                    position: new Vector2(35, 77),
                    direction: 0
                }
            ]
        });

        const character = this._level.gameObjectManager.getObject(1) as Character;

        this.addComponent(new PlayerInput(this, character));
        this.addComponent(new PlayerCamera(this, character, WorldScene.CAMERA_OFFSET, WorldScene.CAMERA_SPEED));

        new HemisphericLight("light", new Vector3(0, 1, 0), this).intensity = 1.4;

        await this.createTerrain();
        this._createDialogue();

        // this.debugLayer.show();

        this._initialized = true;
    }

    private async createTerrain() : Promise<void> {
        const terrain = await SceneLoader.ImportMeshAsync(null, "./assets/models/scenes/", "world.glb", this);
        const ground = terrain.meshes[0] as Mesh;

        ground.position = new Vector3(5, -5.25, 30).add(WorldScene.WORLD_CENTER_3D);
        ground.scaling = new Vector3(-5, 5, 5);

        this.addComponent(new TerrainComponent(this, ground));
    }

    private updateLogic() {
        if (!this._initialized) {
            return;
        }

        const delta = this.getEngine().getDeltaTime() / 1000;
        this._logicTime += delta;
        while (this._logicTime > Time.TICK_DELTA_TIME) {
            this._level.update();
            this._logicTime -= Time.TICK_DELTA_TIME;
        }

        if (this.level.gameObjectManager.getObject(1) === undefined) {
            this._initialized = false;
            this.switchToSpace();
        }
    }

    public update() {
        this.updateLogic();
        super.update();
    }

    private _createDialogue() {
        this._dialogue = new Dialogue();
        this._dialogue.addText(
          "Hmm... Cette planète est étrange. Je devrais aller voir ce qu'il se passe.",
          5000
        );
        this._dialogue.addText(
          "Avancer: Z | Reculer: S | Gauche: Q | Droite: D | Attaquer : Cliquer sur l'ennemi",
          30000
        );
    }

    private switchToSpace() {
        const engine = this.getEngine();
        const scene = new SpaceScene(engine);
        this.dispose();
        scene.init();
    }
}