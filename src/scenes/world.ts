import {
    AbstractMesh,
    DefaultRenderingPipeline,
    DirectionalLight,
    FreeCamera,
    PBRMaterial,
    SceneLoader, SceneOptimizer, SceneOptimizerOptions,
    ScenePerformancePriority,
    ShadowGenerator,
    Vector2,
    Vector3
} from "@babylonjs/core";
import {Engine} from "@babylonjs/core/Engines/engine";
import Level from "../logic/level/level";
import Time from "../logic/time/time";
import PlayerCamera from "../management/component/playerCamera";
import PlayerInput from "../management/component/playerInput";
import Scene from "./scene";
import SpaceScene from "./space";
import SceneConfig from "../logic/config/scene";
import TilemapLoaderComponent from "../management/component/tilemapLoader";
import CinematicComponent from "../management/component/cinematic";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";
import DialogComponent from "../management/component/dialog";
import MeshProvider from "../management/meshprovider";
import UIComponent from "../management/component/ui";
import AudioComponent from "../management/component/audio";

export default class WorldScene extends Scene {
    private static readonly CAMERA_SPEED: number = 15;
    private static readonly CAMERA_OFFSET: Vector3 = new Vector3(0, 25 * 1.5, -20 * 1.5);

    private _config: SceneConfig;

    private _level: Level;
    private _logicTime: number = 0;
    private _initialized: boolean = false;

    private _sun: DirectionalLight;
    private _shadowGenerator: ShadowGenerator;
    private _optimizer: SceneOptimizer;

    constructor(engine: Engine, config: SceneConfig) {
        super(engine);
        this._level = new Level(config.id, new Vector2(Math.floor(config.width / config.precision), Math.floor(config.height / config.precision)), config.precision);
        this._config = config;
        this.onDispose = () => {
            this._level.destroy();
        };

        const options = SceneOptimizerOptions.ModerateDegradationAllowed(60);
        this._optimizer = new SceneOptimizer(this, options, true, true);
    }

    public get level(): Level {
        return this._level;
    }

    public async init(): Promise<void> {
        await super.init();
        await this.createTerrain();

        // await this.debugLayer.show();

        this.blockMaterialDirtyMechanism = true;

        const cinematicCamera = this.cameras[0] as FreeCamera;
        const playerCamera = new TargetCamera("PlayerCamera", Vector3.Up(), this, true);
        this.activeCamera = playerCamera;

        this.addComponent(new PlayerCamera(this, this.activeCamera as TargetCamera, WorldScene.CAMERA_OFFSET, WorldScene.CAMERA_SPEED));
        this.addComponent(new DialogComponent(this, this._level));
        this.addComponent(new UIComponent(this, this._level))
        this.addComponent(new CinematicComponent(this, cinematicCamera, this._level));
        this.addComponent(new PlayerInput(this));
        this.addComponent(new AudioComponent(this, this._level));

        this.loadLevel();

        this._sun = this.lights[0] as DirectionalLight;
        this._sun.autoCalcShadowZBounds = true;

        this._shadowGenerator = new ShadowGenerator(4096, this._sun, null, this.activeCamera);
        this._shadowGenerator.useCloseExponentialShadowMap = true;
        this._shadowGenerator.bias = 0.0001;
        this._shadowGenerator.setDarkness(0.1);

        for (const mesh of this.meshes) {
            if (mesh.receiveShadows) {
                this._shadowGenerator.addShadowCaster(mesh);
                console.log('added shadow caster', mesh.name);
            }
        }

        const cinematicNode = this.transformNodes.find(t => t.name === 'Cinematic');
        if (cinematicNode) {
            for (const subNode of cinematicNode.getChildTransformNodes()) {
                subNode.unfreezeWorldMatrix();
            }
        } else {
            throw new Error('cinematic node not found');
        }

        const defaultPipeline = new DefaultRenderingPipeline("default", true, this, [this.activeCamera, cinematicCamera]);
        defaultPipeline.bloomEnabled = true;
        defaultPipeline.bloomThreshold = 0.05;
        defaultPipeline.bloomWeight = 0.35;
        defaultPipeline.bloomScale = 1;
        defaultPipeline.bloomKernel = 32;

        defaultPipeline.imageProcessingEnabled = true;
        defaultPipeline.imageProcessing.contrast = 1.10;
        defaultPipeline.imageProcessing.exposure = 1.15;
        defaultPipeline.imageProcessing.toneMappingEnabled = false;
        defaultPipeline.imageProcessing.vignetteEnabled = true;
        defaultPipeline.imageProcessing.vignetteWeight = 2.5;
        defaultPipeline.imageProcessing.vignetteStretch = 0.5;

        /*const skybox = Mesh.CreateBox("skyBox", 5000.0, this);
        const skyboxMaterial = new StandardMaterial("skyBox", this);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("https://assets.babylonjs.com/textures/TropicalSunnyDay", this);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;*/

        this._initialized = true;
        this._optimizer.start();

        await MeshProvider.instance.executeAsync();

        console.log('scene initialized');
    }

    private loadLevel() {
        const loadData = [];
        for (const object of this._config.objects) {
            console.log('loading object', object.name);

            loadData.push({
                id: object.id,
                position: new Vector3(object.position.x, object.position.y, 0),
                direction: Math.PI / 2 - object.direction,
                type: object.type,
                ...object.params
            });
        }

        this._level.load({
            objects: loadData,
            points: this._config.points,
        });

        const player = this._level.gameObjectManager.player;
        const playerCamera = this.getComponent(PlayerCamera);
        if (playerCamera !== null) {
            playerCamera.target = player;
        }

        const playerInput = this.getComponent(PlayerInput);
        if (playerInput !== null) {
            playerInput.character = player;
        }
    }

    private async createTerrain() : Promise<void> {
        const assetRootPath = "assets/scenes/" + this._config.name + "/models/";
        const assetLoaderPromises = [];

        for (const model of this._config.models) {
            // convert unity coordinates to babylon coordinates
            const position = new Vector3(model.position.x, model.position.y, model.position.z);
            position.x *= -1;
            position.z *= -1;
            const rotation = new Vector3(model.rotation.x * Math.PI / 180, model.rotation.y * Math.PI / 180, model.rotation.z * Math.PI / 180);
            const scaling = new Vector3(model.scale.x, model.scale.y, model.scale.z);
            scaling.x *= -1; 

            assetLoaderPromises.push(this.loadModelAsync(assetRootPath + model.path, position, rotation, scaling));
        }

        await Promise.all(assetLoaderPromises);

        if (this._config.useBakedTilemap) {
            const tilemapComponent = new TilemapLoaderComponent(this._config, this._level);
            this.addComponent(tilemapComponent);
            await tilemapComponent.loadAsync();
        } else {
            throw new Error("Non baked tilemap is not supported now");
        }
    }

    private async loadModelAsync(path: string, position: Vector3, rotation: Vector3, scaling: Vector3): Promise<void> {
        console.log("Loading model", path);
        
        const model = await SceneLoader.ImportMeshAsync("", path, null, this);
        const root = model.meshes[0];

        root.position = position;
        root.rotation = rotation;
        root.scaling = scaling;

        for (const child of model.meshes) {
            this._optimizeMesh(child);
        }

        const excludeShadowMeshNames = [
            "_rock_",
            "_rocks_",
            "_grass_",
        ]
        for (const mesh of model.meshes) {
            let exclude = false;
            const lowerName = mesh.name.toLowerCase();
            for (const excludeName of excludeShadowMeshNames) {
                if (lowerName.indexOf(excludeName) !== -1) {
                    exclude = true;
                    break;
                }
            }
            if (!exclude) {
                mesh.receiveShadows = true;
                // set roughness to 0.25
                if (mesh.material instanceof PBRMaterial) {
                    mesh.material.roughness = 0.25;
                }
            }
        }
    }

    private _optimizeMesh(mesh: AbstractMesh) {
        mesh.computeWorldMatrix(true);
        mesh.freezeWorldMatrix();
        mesh.checkCollisions = false;
        // mesh.isPickable = false;

        if (mesh.material) {
            mesh.material.freeze();
        }

        mesh.cullingStrategy = AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
    }

    private updateLogic() {
        if (!this._initialized) {
            return;
        }

        const delta = this.getEngine().getDeltaTime() / 1000;
        this._logicTime = Math.min(this._logicTime + delta, 10000);
        while (this._logicTime > Time.TICK_DELTA_TIME) {
            this._level.update();
            this._logicTime -= Time.TICK_DELTA_TIME;
        }

        const character = this._level.gameObjectManager.player;
        if (character === null) {
            this.loadLevel();
        }
    }

    public update() {
        this.updateLogic();
        super.update();
    }

    private switchToSpace() {
        const engine = this.getEngine();
        const scene = new SpaceScene(engine);
        scene.init().then(() => {
            this.dispose();
        });
    }

    private _reloadCurrentScene() {
        const engine = this.getEngine();
        const scene = new WorldScene(engine, this._config);
        scene.init().then(() => {
            this.dispose();
        });
    }
}