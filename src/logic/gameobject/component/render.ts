import { AbstractMesh, Vector3 } from "@babylonjs/core";
import MeshProvider, { MeshAsyncHandle } from "../../../management/meshprovider";
import RenderConfig from "../../config/component/render";
import Character from "../character";
import GameObject from "../gameObject";
import AnimationComponent from "./animation";
import Component, { ComponentType } from "./component";

export default class RenderComponent extends Component {
    private _handle: MeshAsyncHandle;
    private _mesh: AbstractMesh;

    public constructor(parent: GameObject, config: RenderConfig) {
        super(parent);
        this._handle = MeshProvider.instance.load(config.model);
        this._handle.onLoaded = (result) => {
            this._mesh = result.meshes[0];

            result.animationGroups.forEach((animationGroup) => {
                animationGroup.targetedAnimations.forEach((animation) => {
                animation.animation.enableBlending = true;
                animation.animation.blendingSpeed = 0.2;
                });
            });

            // apply scale
            this._mesh.scaling = new Vector3(-config.scale, config.scale, -config.scale);
            
            const animationComponent = this.parent.findComponent(AnimationComponent);
            if (animationComponent) {
                animationComponent.setGroups(result.animationGroups);
            }
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
        if (this._mesh) {
            this._mesh.position.x = this.parent.position.x;
            this._mesh.position.z = this.parent.position.y;
            const fromRotation = this._mesh.rotation;
            const toRotation = new Vector3(0, -this.parent.direction, 0);
            const deltaRotation = toRotation.subtract(fromRotation);
            if (deltaRotation.y > Math.PI) {
                deltaRotation.y -= Math.PI * 2;
            }
            if (deltaRotation.y < -Math.PI) {
                deltaRotation.y += Math.PI * 2;
            }
            this._mesh.rotation = fromRotation.add(deltaRotation.scale(0.2));
        }
    }
}