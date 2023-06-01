import { AbstractMesh, Vector3 } from "@babylonjs/core";
import MeshProvider, { MeshAsyncHandle } from "../../../management/meshprovider";
import RenderConfig from "../../config/component/render";
import Character from "../character";
import GameObject from "../gameObject";
import AnimationComponent from "./animation";
import Component, { ComponentType } from "./component";
import {EventList, EventListT} from "../../util/eventList";

export default class RenderComponent extends Component {
    private _handle: MeshAsyncHandle;
    private _mesh: AbstractMesh;
    private _rotationOffsetX;

    public onLoaded: EventListT<AbstractMesh> = new EventListT<AbstractMesh>();

    private _hide: boolean = false;

    public constructor(parent: GameObject, config: RenderConfig = null) {
        super(parent);
        this._handle = MeshProvider.instance.load(config.model);
        this._handle.onLoaded = (result) => {
            this._mesh = result.meshes[0];

            result.animationGroups.forEach((animationGroup) => {
                animationGroup.targetedAnimations.forEach((animation) => {
                animation.animation.enableBlending = true;
                animation.animation.blendingSpeed = 0.25;
                });
            });

            // apply scale
            this._mesh.scaling = new Vector3(-config.scale, config.scale, -config.scale);
            this._rotationOffsetX = config.rotation * (Math.PI / 180);
            
            const animationComponent = this.parent.findComponent(AnimationComponent);
            if (animationComponent) {
                animationComponent.setGroups(result.animationGroups);
            }

            const scene = this._mesh.getScene();
            if (scene) {
                scene.onBeforeRenderObservable.add(this.updateRender.bind(this));
                this._mesh.position = new Vector3(this.parent.position.x, 0, this.parent.position.y);
            } else {
                console.error("No scene found for mesh");
            }

            this.onLoaded.trigger(this._mesh);
        };
    }

    public destroy(): void {
        super.destroy();
        if (this._mesh) {
            this._mesh.dispose();
            this._mesh = null;
        }
        if (this._handle) {
            this._handle.dispose();
            this._handle = null;
        }
    }
    
    public get type(): ComponentType {
        return ComponentType.Render;
    }
    public update(): void {

    }

    public updateRender(): void {
        if (this._mesh) {
            const obj3D = new Vector3(this.parent.position.x, 0, this.parent.position.y);
            const fromRotation = this._mesh.rotation;
            const toRotation = new Vector3(this._rotationOffsetX, -this.parent.direction, 0);
            const deltaRotation = toRotation.subtract(fromRotation);
            if (deltaRotation.y > Math.PI) {
                deltaRotation.y -= Math.PI * 2;
            }
            if (deltaRotation.y < -Math.PI) {
                deltaRotation.y += Math.PI * 2;
            }

            this._mesh.position = Vector3.Lerp(this._mesh.position, obj3D, 0.2);
            this._mesh.rotation = fromRotation.add(deltaRotation.scale(0.2));

            if (this._hide) {
                obj3D.y = -100;
                this._mesh.position = obj3D;
            } else if (this._mesh.position.y < -0.1) {
                this._mesh.position = obj3D;
            }
        }
    }

    public hide() {
        this._hide = true;
    }

    public show() {
        this._hide = false;
    }
}