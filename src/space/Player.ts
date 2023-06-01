import {
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  Quaternion,
  Scene,
  UniversalCamera,
  Vector3,
} from "@babylonjs/core";

export class FirstPersonPlayer {
  private scene: Scene;
  private playerMesh: Mesh;
  private _camera: UniversalCamera;
  private _startPosition: Vector3;
  private _moveSpeedPerSec = 0.4;
  private _moveRunPerSec = 0.65;
  private _moveForward = false;
  private _moveLeft = false;
  private _moveRight = false;
  private _moveBackward = false;
  private _shift = false;
  private _playerRotation = 0;
  private inputObservable: any;
  private _playerEnabled = false;

  constructor(scene: Scene, startPosition: Vector3) {
    this.scene = scene;
    this._startPosition = startPosition;

    this.setupCamera();
    this.setupPlayer();

    this.scene.onBeforeRenderObservable.add(() => {
      this._update();
    });
  }

  private setupCamera() {
    this._camera = new UniversalCamera(
      "playerCamera",
      new Vector3(0, 0, 0),
      this.scene
    );
    this._camera.attachControl();
    this._camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
    this._camera.parent = this.playerMesh;
    this._camera.position = new Vector3(0, 1.3, 0);
    this._camera.rotationQuaternion = Quaternion.Identity();
    //rotation 0 100 0
    this._camera.rotationQuaternion = Quaternion.FromEulerAngles(0, 1.74, 0);
  }

  private setupPlayer() {
    this.playerMesh = MeshBuilder.CreateCapsule(
      "player",
      { radius: 0.5, height: 2 },
      this.scene
    );
    this.playerMesh.position = this._startPosition;
    this.playerMesh.physicsImpostor = new PhysicsImpostor(
      this.playerMesh,
      PhysicsImpostor.CapsuleImpostor,
      { mass: 1, restitution: 0, friction: 1 },
      this.scene
    );
    this.playerMesh.checkCollisions = true;
    this.playerMesh.ellipsoid = new Vector3(0.1, 1, 0.1);
    this.playerMesh.ellipsoidOffset = new Vector3(0, 1, 0);
    this.playerMesh.isVisible = false;
  }

  private setupControls() {
    this.inputObservable = this.scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          if (kbInfo.event.key === "z") {
            this._moveForward = true;
          }
          if (kbInfo.event.key === "s") {
            this._moveBackward = true;
          }
          if (kbInfo.event.key === "q") {
            this._moveLeft = true;
          }
          if (kbInfo.event.key === "d") {
            this._moveRight = true;
          }
          if (kbInfo.event.key === "Shift") {
            this._shift = true;
          }
          break;
      }
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYUP:
          if (kbInfo.event.key === "z") {
            this._moveForward = false;
          }
          if (kbInfo.event.key === "s") {
            this._moveBackward = false;
          }
          if (kbInfo.event.key === "q") {
            this._moveLeft = false;
          }
          if (kbInfo.event.key === "d") {
            this._moveRight = false;
          }
          if (kbInfo.event.key === "Shift") {
            this._shift = false;
          }
          break;
      }
    });
  }

  private _update() {
    if (!this._playerEnabled) return;

    let z = 0;
    if (this._moveForward) {
      z += this._moveSpeedPerSec;
    }
    if (this._moveBackward) {
      z -= this._moveSpeedPerSec;
    }
    let x = 0;
    if (this._moveLeft) {
      x -= this._moveSpeedPerSec;
    }
    if (this._moveRight) {
      x += this._moveSpeedPerSec;
    }
    let speed = this._moveSpeedPerSec;
    if (this._shift) {
      speed = this._moveRunPerSec;
    }

    let move = new Vector3(x, 0, z);
    let dir = Vector3.TransformNormal(move, this._camera.getWorldMatrix());
    dir.y = 0;

    this.playerMesh.physicsImpostor.setLinearVelocity(new Vector3(0, -1, 0));
    this.playerMesh.moveWithCollisions(dir.scale(speed));
    this.playerMesh.rotationQuaternion = Quaternion.FromEulerAngles(
      0,
      this._playerRotation,
      0
    );
  }

  public dispawn() {
    this.scene.onKeyboardObservable.remove(this.inputObservable);
    this.playerMesh.position = this._startPosition;
    this._playerEnabled = false;
  }

  public spawn() {
    this.setupPlayer();
    this.setupControls();
    this._camera.parent = this.playerMesh;
    this.scene.activeCamera = this._camera;
    this._playerEnabled = true;
  }

  public get position(): Vector3 {
    return this.playerMesh.position;
  }

  getCamera() {
    return this._camera;
  }

  getPlayerMesh() {
    return this.playerMesh;
  }
}
