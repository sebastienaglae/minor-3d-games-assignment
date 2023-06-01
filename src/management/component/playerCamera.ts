import {Camera, Vector3} from "@babylonjs/core";
import GameObject from "../../logic/gameobject/gameObject";
import WorldScene from "../../scenes/world";
import ISceneComponent from "./interface";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";

export default class PlayerCamera implements ISceneComponent {
    private _scene: WorldScene;
    private _camera: TargetCamera;
    private _target: GameObject | null;
    private _offset: Vector3;

    private _speed: number;

    private _tracking: boolean;

    constructor(scene: WorldScene, camera: TargetCamera, offset: Vector3, speed: number = 10) {
        this._scene = scene;
        this._camera = camera;
        this._camera.mode = Camera.PERSPECTIVE_CAMERA;
        this._camera.position = offset;
        this._camera.parent = null;

        this._target = null;
        this._offset = offset;
        this._speed = speed;
    }

    public update(t: number): void {
        if (!this._tracking) {
            return;
        }

        if (this._target) {
            const target3D = new Vector3(this._target.position.x, 0, this._target.position.y);
            const currentPosition = this._camera.position;
            const targetPosition = target3D.add(this._offset);
            const newPosition = Vector3.Lerp(currentPosition, targetPosition, this._speed * t);

            this._camera.position = newPosition;

            // calculate the new x direction
            const direction = target3D.subtract(newPosition);
            direction.normalize();
            const angle = Math.atan2(direction.y, direction.z);
            this._camera.rotation = new Vector3(-angle, 0, 0);
        } else {
            console.warn('No target set for player camera');
        }
    }

    public get tracking(): boolean {
        return this._tracking;
    }

    public set tracking(tracking: boolean) {
        this._tracking = tracking;
        this._camera.position = new Vector3(this._target.position.x, 0, this._target.position.y).add(this._offset);
    }

    public get enabled(): boolean {
        return this._camera.isEnabled();
    }

    public set enabled(enabled: boolean) {
        this._camera.setEnabled(enabled);
    }

    public get camera(): TargetCamera {
        return this._camera;
    }

    public set target(target: GameObject) {
        this._target = target;
        this.tracking = true;
    }

    public destroy(): void {
        this._camera = null;
        this._target = null;
    }
}