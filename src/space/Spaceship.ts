import {
  AbstractMesh,
  Axis,
  PhysicsImpostor,
  Quaternion,
  Scene,
  SceneLoader,
  UniversalCamera,
  Vector3,
  Vector4,
  Matrix,
  MeshBuilder,
  Observable,
  KeyboardInfo,
  Observer,
} from "@babylonjs/core";
import { Utils } from "./utils/Utils";
import { PlanetManager } from "./PlanetManager";
import { Planet } from "./Planet";
import { ColorFactory } from "./colors/ColorFactory";
import { TrailsManager } from "./effects/TrailsManager";
import { CloudEffect } from "./effects/CloudEffect";
import { Dashboard } from "./ui/Dashboard";

export class Spaceship {
  private _parentMesh: AbstractMesh;
  private _spaceship: AbstractMesh;
  private _spaceship1: AbstractMesh;
  private _scene: Scene;
  private _camera: UniversalCamera;
  private _speed: number;
  private _speedKm: number;
  private _velocity: Vector3;
  private _maxSpeed: number;
  private _acceleration: number;
  private _deceleration: number;
  private _rotationSpeedHori: number;
  private _rotationSpeedVer: number;
  private _maxRotationSpeed: number;
  private _rotationAcceleration: number;
  private _rotationDeceleration: number;
  private _isGoingUp: boolean;
  private _isGoingDown: boolean;
  private _isGoingLeft: boolean;
  private _isGoingRight: boolean;
  private _isGoingForward: boolean;
  private _isGoingBackward: boolean;
  private _lockMovement: boolean;
  private _lockSpeed: number;

  private _speedCooldown = 0;
  private _speedRefresh = 0.1;

  private _rootUrl: string;
  private _sceneFilename: string;
  private _scaleFactor: number = 0.1;
  private _scaleSpeed: number = 40;

  private _r: Vector4;
  private _t: number;
  private _projectionMatrix: Matrix;

  private _trailsEntry: TrailsManager;
  private _trailsSpeed: TrailsManager;
  private _cloudEffect: CloudEffect;
  private _dashboard: Dashboard;
  private _planetManager: PlanetManager;
  private _selectedPlanetIndex: number;
  private _planetData: {
    planet: Planet;
    distance: number;
  };

  private _spaceshipEnabled: boolean = false;

  private _spaceshipCollisionObservable: Observable<Planet> =
    new Observable<Planet>();
  private _keyboardObserver: Observer<KeyboardInfo>;
  private _firstView = true;
  private _uiUpdateTime = 0;

  constructor(rootUrl: string, sceneFilename: string, scene: Scene) {
    this._rootUrl = rootUrl;
    this._sceneFilename = sceneFilename;
    this._scene = scene;
    this._setupCamera();
    this._maxSpeed = 5 * this._scaleFactor;
    this._acceleration = (35 * this._scaleFactor) / this._scaleSpeed;
    this._deceleration = (1 * this._scaleFactor) / this._scaleSpeed;
    this._maxRotationSpeed = 0.05;
    this._rotationAcceleration = 0.025;
    this._rotationDeceleration = 0.004;
    this._selectedPlanetIndex = 0;

    this._setupShake();

    this._scene.onBeforeRenderObservable.add(() => {
      this._update();
    });
  }

  public async spawnAsync(planets: PlanetManager) {
    this._planetManager = planets;
    let result = await SceneLoader.ImportMeshAsync(
      "",
      this._rootUrl,
      this._sceneFilename,
      this._scene
    );
    this._spaceship = result.meshes[0];
    this._spaceship1 = result.meshes[1];
  }

  private _setupDashboard() {
    if (this._dashboard != null) {
      return;
    }
    this._dashboard = new Dashboard(this._scene, this._spaceship);
  }

  private _setupEffect() {
    if (this._trailsEntry != null) {
      return;
    }
    this._trailsEntry = new TrailsManager(
      50,
      this._scene,
      this._spaceship,
      0.1,
      4,
      true,
      ColorFactory.yellow()
    );
    this._trailsEntry.start();
    this._trailsEntry.changeEmitRate(0);

    this._trailsSpeed = new TrailsManager(
      10,
      this._scene,
      this._spaceship,
      0.5,
      4,
      true,
      ColorFactory.purple()
    );
    this._trailsSpeed.start();

    this._cloudEffect = new CloudEffect(this._scene, this._spaceship);
    this._cloudEffect.start();
  }

  private _setupShake() {
    this._projectionMatrix = this._camera.getProjectionMatrix();
    this._r = this._projectionMatrix.getRow(3);
    this._t = 0;
  }

  private _setupSpaceship() {
    if (this._parentMesh != null) {
      return;
    }

    this._spaceship.isVisible = true;
    this._parentMesh = MeshBuilder.CreateBox(
      "parentMesh",
      { size: 1 },
      this._scene
    );
    this._parentMesh.position = new Vector3(150, 150, 150);
    this._parentMesh.rotationQuaternion = Quaternion.Identity();
    this._parentMesh.rotationQuaternion = Quaternion.FromEulerAngles(
      0.8901179,
      -2.094395,
      0.1745329
    );

    this._parentMesh.isVisible = false;
    this._spaceship.parent = this._parentMesh;
    this._spaceship.rotationQuaternion = Quaternion.Identity();
    this._spaceship.position = new Vector3(0, 0, 0);
    this._spaceship1.position = new Vector3(0, 0, 0);
    this._parentMesh.physicsImpostor = new PhysicsImpostor(
      this._spaceship,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.9, friction: 0 },
      this._scene
    );

    this._spaceship.scaling = new Vector3(
      this._scaleFactor,
      this._scaleFactor,
      this._scaleFactor
    );
  }

  private _setupCamera() {
    this._camera = new UniversalCamera(
      "camera",
      new Vector3(0, 1.2, -1.5),
      this._scene
    );
    this._camera.detachControl();
    this._camera.fov = 1.4;
    this._camera.maxZ = 100000;
  }

  private _setupKeyboardInput() {
    this._keyboardObserver = this._scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case 1:
          switch (kbInfo.event.key) {
            case "q":
              this._isGoingLeft = true;
              break;
            case "d":
              this._isGoingRight = true;
              break;
            case "z":
              this._isGoingUp = true;
              break;
            case "s":
              this._isGoingDown = true;
              break;
            case " ":
              this._isGoingForward = true;
              break;
            case "Shift":
              this._isGoingBackward = true;
              break;
            case "e":
              this._reorientToPlanet();
              break;
            case "r":
              this._toggleCameraView();
              break;
            case "ArrowUp":
              this._selectedPlanetIndex++;
              break;
            case "ArrowDown":
              this._selectedPlanetIndex--;
              break;
          }
          break;
        case 2:
          switch (kbInfo.event.key) {
            case "q":
              this._isGoingLeft = false;
              break;
            case "d":
              this._isGoingRight = false;
              break;
            case "z":
              this._isGoingUp = false;
              break;
            case "s":
              this._isGoingDown = false;
              break;
            case " ":
              this._isGoingForward = false;
              break;
            case "Shift":
              this._isGoingBackward = false;
              break;
          }
          break;
      }
    });
  }

  private _toggleCameraView() {
    this._firstView = !this._firstView;
    if (this._firstView) {
      this._cameraFirstView();
    } else {
      this._cameraSecondView();
    }
  }

  private _cameraFirstView() {
    this._camera.position = new Vector3(0, 1.2, -1.5);
    this._camera.rotation = new Vector3(0, 0, 0);
    this._camera.fov = 1.4;
  }

  private _cameraSecondView() {
    this._camera.position = new Vector3(0, 2, -5);
    this._camera.rotation = new Vector3(0, 0, 0);
    this._camera.fov = 1.4;
  }

  private _update() {
    if (!this._spaceshipEnabled) return;
    if (this._uiUpdateTime > 0) {
      this._uiUpdateTime -= this._scene.getEngine().getDeltaTime();
    } else {
      this._uiUpdateTime = 250;
      this._updateDashboard();
    }
      

    this._shakeCamera();
    if (this._lockMovement) return;
    var deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    let isPressed = false;
    if (this._isGoingBackward) {
      this._speed += this._acceleration * deltaTime;
      if (this._speed >= 0) {
        this._speed = 0;
      } else if (this._speed > this._maxSpeed) {
        this._speed = this._maxSpeed;
      }
    }
    if (this._isGoingForward) {
      this._speed -= this._acceleration * deltaTime;
      if (this._speed < -this._maxSpeed) {
        this._speed = -this._maxSpeed;
      }
    }
    // Left and right
    if (this._isGoingRight) {
      isPressed = true;
      this._rotationSpeedHori += this._rotationAcceleration * deltaTime;
      if (this._rotationSpeedHori > this._maxRotationSpeed) {
        this._rotationSpeedHori = this._maxRotationSpeed;
      }
    }
    if (this._isGoingLeft) {
      isPressed = true;
      this._rotationSpeedHori -= this._rotationAcceleration * deltaTime;
      if (this._rotationSpeedHori < -this._maxRotationSpeed) {
        this._rotationSpeedHori = -this._maxRotationSpeed;
      }
    }
    // Up and down
    if (this._isGoingUp) {
      isPressed = true;
      this._rotationSpeedVer += this._rotationAcceleration * deltaTime;
      if (this._rotationSpeedVer > this._maxRotationSpeed) {
        this._rotationSpeedVer = this._maxRotationSpeed;
      }
    }
    if (this._isGoingDown) {
      isPressed = true;
      this._rotationSpeedVer -= this._rotationAcceleration * deltaTime;
      if (this._rotationSpeedVer < -this._maxRotationSpeed) {
        this._rotationSpeedVer = -this._maxRotationSpeed;
      }
    }
    if (!isPressed) {
      // Horizontal deceleration (left and right)
      if (this._rotationSpeedHori > 0) {
        this._rotationSpeedHori -= this._rotationDeceleration * deltaTime;
        if (this._rotationSpeedHori < 0) {
          this._rotationSpeedHori = 0;
        }
      }
      if (this._rotationSpeedHori < 0) {
        this._rotationSpeedHori += this._rotationDeceleration * deltaTime;
        if (this._rotationSpeedHori > 0) {
          this._rotationSpeedHori = 0;
        }
      }
      // Vertical deceleration (up and down)
      if (this._rotationSpeedVer > 0) {
        this._rotationSpeedVer -= this._rotationDeceleration * deltaTime;
        if (this._rotationSpeedVer < 0) {
          this._rotationSpeedVer = 0;
        }
      }
      if (this._rotationSpeedVer < 0) {
        this._rotationSpeedVer += this._rotationDeceleration * deltaTime;
        if (this._rotationSpeedVer > 0) {
          this._rotationSpeedVer = 0;
        }
      }
      // Speed deceleration
      if (this._speed > 0) {
        this._speed -= this._deceleration * deltaTime;
        if (this._speed < 0) {
          this._speed = 0;
        }
      } else if (this._speed < 0) {
        this._speed += this._deceleration * deltaTime;
        if (this._speed > 0) {
          this._speed = 0;
        }
      }
    }
    this._turnHorizontal(this._rotationSpeedHori);
    this._turnVertical(this._rotationSpeedVer);

    this._velocity = this._parentMesh.forward.scale(-this._speed);
    this._parentMesh.moveWithCollisions(this._velocity);
    
    this._computeSpeedKm();

    this._planetData = this._planetManager.getPlanet(
      this._selectedPlanetIndex,
      this._parentMesh
    );

    this._updateEffects();
    if (
      this._planetData.distance <= this._planetData.planet.getAtmosphereRadius()
    ) {
      this._fakeStop();
    }
  }

  private _updateEffects() {
    this._trailsSpeed.changeEmitRate(
      Utils.clamp(0, this._maxSpeed, -this._speed)
    );
    let min = this._planetData.planet.getAtmosphereRadius();
    let max = this._planetData.planet.getRadius() * 5;
    this._cloudEffect.changeEmitRate(
      1 -
        Utils.clamp(
          this._planetData.planet.getRadius() * 4,
          max,
          this._planetData.distance
        )
    );
    this._trailsEntry.changeEmitRate(
      1 -
        Utils.clamp(
          this._planetData.planet.getRadius() * 4,
          max,
          this._planetData.distance
        )
    );
  }

  private _fakeStop() {
    if (!this._spaceshipEnabled) return;
    this._planetManager.disposeAll();
    this._lockSpeed = this._speed;
    this._lockMove();
    console.log("fake stop on planet " + this._planetData.planet.getName());
    this._spaceshipCollisionObservable.notifyObservers(this._planetData.planet);
  }

  private _lockMove() {
    this._lockMovement = true;
  }

  private _unlockMove() {
    this._lockMovement = false;
  }

  private _computeSpeedKm() {
    if (this._lockMovement) return;
    this._speedCooldown -= this._scene.getEngine().getDeltaTime();
    if (this._speedCooldown <= 0) {
      this._speedKm =
        ((((-this._speed * 3.6) / this._speedRefresh) * 1) /
          this._scaleFactor) *
        this._scaleSpeed;
      this._speedCooldown = this._speedRefresh;
    }
  }

  private _turnHorizontal(angle: number) {
    const quaternion = Quaternion.RotationAxis(Axis.Y, angle);
    this._parentMesh.rotationQuaternion.multiplyInPlace(quaternion);
  }

  private _turnVertical(angle: number) {
    const quaternion = Quaternion.RotationAxis(Axis.X, -angle);
    this._parentMesh.rotationQuaternion.multiplyInPlace(quaternion);
  }

  private _shakeCamera() {
    let speed = this._speed;
    if (this._lockMovement) speed = this._lockSpeed;

    this._r.x +=
      Math.cos(this._t) * 0.01 * Utils.clamp(0, this._maxSpeed, -speed);
    this._r.y +=
      Math.sin(this._t) * 0.01 * Utils.clamp(0, this._maxSpeed, -speed);
    this._projectionMatrix.setRowFromFloats(
      3,
      this._r.x,
      this._r.y,
      this._r.z,
      this._r.w
    );
    this._t += 81337.18;
  }

  private _updateDashboard() {
    let speed = this._speed;
    if (this._lockMovement) speed = this._lockSpeed;
    this._dashboard.setAllEngText(Utils.clamp(0, this._maxSpeed, -speed) * 100);
    this._dashboard.setSpeedText(this._speedKm);
    this._dashboard.setPlanetText(
      this._planetData?.planet.getName() ?? "Inconnu"
    );
    this._dashboard.setDistanceText(
      this._planetData?.distance * this._scaleSpeed ?? 0
    );
    this._dashboard.updateTime();
    this._dashboard.updateFPSText();
  }

  public _reorientToPlanet() {
    if (!this._planetData) return;
    if (this._lockMovement) return;
    this._rotationSpeedHori = 0;
    this._rotationSpeedVer = 0;
    this._parentMesh.lookAt(this._planetData.planet.getMesh().position);
  }

  public subCollision(callback: (spaceship: Planet) => void) {
    this._spaceshipCollisionObservable.add(callback);
  }

  public enterSpaceship() {
    this._speed = 0;
    this._speedKm = 0;
    this._velocity = new Vector3(0, 0, 0);
    this._rotationSpeedHori = 0;
    this._rotationSpeedVer = 0;
    this._isGoingUp = false;
    this._isGoingDown = false;
    this._isGoingLeft = false;
    this._isGoingRight = false;
    this._isGoingForward = false;
    this._isGoingBackward = false;
    this._scene.activeCamera = this._camera;
    this._camera.parent = this._spaceship;
    this._unlockMove();
    this._setupSpaceship();
    this._setupEffect();
    this._setupKeyboardInput();
    this._setupDashboard();
    this._spaceshipEnabled = true;
  }

  public exitSpaceship() {
    this._spaceshipEnabled = false;
    this._lockMove();
    this._destroyEffect();
    this._scene.onKeyboardObservable.remove(this._keyboardObserver);
  }

  private _destroyEffect() {
    this._spaceshipEnabled = false;
  }

  public getCamera() {
    return this._camera;
  }
}
