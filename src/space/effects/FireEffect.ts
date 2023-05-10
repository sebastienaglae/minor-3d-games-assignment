import {
  Color4,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "@babylonjs/core";

export class FireEffect extends ParticleSystem {
  constructor(scene: Scene, emitter: any) {
    super("fire", 2000, scene);

    this.particleTexture = new Texture(
      "assets/space/effects/flare.png",
      scene
    );

    this.emitter = emitter;
    this.minEmitBox = new Vector3(-0.15, -0.15, -0.15);
    this.maxEmitBox = new Vector3(0.15, 0.15, 0.15);

    this.color1 = new Color4(1, 0.5, 0, 1.0);
    this.color2 = new Color4(1, 0.5, 0, 1.0);
    this.colorDead = new Color4(0, 0, 0, 0.0);

    this.minSize = 0.3;
    this.maxSize = 1;

    this.minLifeTime = 0.2;
    this.maxLifeTime = 0.4;

    this.emitRate = 600;

    this.blendMode = ParticleSystem.BLENDMODE_ONEONE;

    this.gravity = new Vector3(0, 0, 0);

    this.direction1 = Vector3.Down();
    this.direction2 = Vector3.Down();

    this.minAngularSpeed = 0;
    this.maxAngularSpeed = Math.PI;

    this.minEmitPower = 1;
    this.maxEmitPower = 3;
    this.updateSpeed = 0.007;
  }
}
