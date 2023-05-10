import { Camera, FlyCamera, Vector3 } from "@babylonjs/core";
import GameObject from "../../logic/gameobject/gameObject";
import WorldScene from "../../scenes/world";
import ISceneComponent from "./interface";

export default class PlayerCamera implements ISceneComponent {
    private _scene: WorldScene;
    private _camera: FlyCamera;
    private _target: GameObject;
    private _offset: Vector3;

    private _speed: number;

    constructor(scene: WorldScene, target: GameObject, offset: Vector3, speed: number = 10) {
        this._scene = scene;
        this._camera = new FlyCamera("camera", Vector3.Zero(), scene);
        this._camera.mode = Camera.ORTHOGRAPHIC_CAMERA;

        const rect   = scene.getEngine().getRenderingCanvasClientRect();
        const aspect = rect.height / rect.width; 
        const radius = 20;
        this._camera.orthoLeft   = -radius;
        this._camera.orthoRight  =  radius;
        this._camera.orthoBottom = -radius * aspect;
        this._camera.orthoTop    =  radius * aspect;   

        this._target = target;
        this._offset = offset;
        this._speed = speed;
    }

    public update(t: number): void {
        if (this._target) {
            const target3D = new Vector3(this._target.position.x, 0, this._target.position.y);
            const currentPosition = this._camera.position;
            const targetPosition = target3D.add(this._offset);
            const newPosition = Vector3.Lerp(currentPosition, targetPosition, this._speed * t);

            this._camera.position = newPosition;
            this._camera.setTarget(target3D);

            const rotation = this._camera.rotation;
            rotation.y = 0;
            rotation.z = 0;
            this._camera.rotation = rotation;
        }
    }

    public destroy(): void {
        this._camera = null;
        this._target = null;
    }
}