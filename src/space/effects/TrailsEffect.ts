import {
  AbstractMesh,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { ColorTheme } from "../colors/ColorTheme";

export class TrailsEffect extends ParticleSystem {
  private _box: Mesh;
  constructor(
    name: string,
    capacity: number,
    scene: any,
    spaceShip: AbstractMesh,
    color: ColorTheme
  ) {
    super(name, capacity, scene);
    this._box = MeshBuilder.CreateBox("box", { size: 0.01 }, scene);
    this._box.isVisible = false;

    this.particleTexture = new Texture("assets/space/effects/flare.png", scene);
    this._box.parent = spaceShip;
    this.emitter = this._box;
    this.isLocal = true;

    this.minEmitBox = new Vector3(0, 0, 0);
    this.maxEmitBox = new Vector3(0, 0, 0);
    this.color1 = color.color1;
    this.color2 = color.color2;
    this.colorDead = color.color3;
    this.minSize = 0.1;
    this.maxSize = 0.5;
    this.minLifeTime = 0.3;
    this.maxLifeTime = 1.5;
    this.emitRate = 0;
    this.blendMode = ParticleSystem.BLENDMODE_ONEONE;
    this.gravity = new Vector3(0, 0, -10);
    this.direction1 = new Vector3(-1, 4, 1);
    this.direction2 = new Vector3(1, 4, -1);
    this.minEmitPower = 0;
    this.maxEmitPower = 0;
    this.updateSpeed = 0.005;
  }

}
