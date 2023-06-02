import {
  Scene,
  Mesh,
  Vector3,
  MeshBuilder,
  TransformNode,
  SolidParticleSystem,
  SceneLoader,
  PhysicsImpostor,
  AbstractMesh,
} from "@babylonjs/core";

export class AsteroidManager {
  private scene: Scene;
  private isDisable: boolean;
  private asteroids: Asteroid[];
  private asteroidOrigin = new Vector3(0, 0, 0);
  private meshCollideWith: AbstractMesh;

  constructor(scene: Scene) {
    this.scene = scene;
    this.asteroids = [];
  }

  public async importMeshesAsync(
    asteroidsCount: number,
    maxDistance: number,
    maxHeight: number,
    meshCollideWith: AbstractMesh
  ) {
    this.meshCollideWith = meshCollideWith;
    const asteroidMesh0 = (
      await SceneLoader.ImportMeshAsync(
        "",
        "assets/space/obj/",
        "Eros_1_10.glb",
        this.scene
      )
    ).meshes[0];

    const asteroidMesh1 = (
      await SceneLoader.ImportMeshAsync(
        "",
        "assets/space/obj/",
        "Itokawa_1_1.glb",
        this.scene
      )
    ).meshes[0];

    for (let i = 0; i < asteroidsCount; i++) {
      const name = `asteroid${i}`;
      const lodMesh =
        Math.random() > 0.5
          ? asteroidMesh0.clone(name, null)
          : asteroidMesh1.clone(name, null);

      const asteroid = new Asteroid(
        lodMesh as Mesh,
        this.asteroidOrigin,
        0.01,
        maxDistance,
        maxHeight,
        this.meshCollideWith
      );
      this.asteroids.push(asteroid);
    }
    asteroidMesh0.dispose();
    asteroidMesh1.dispose();
  }

  public bindOnCollide(callback: () => void) {
    this.asteroids.forEach((asteroid) => {
      asteroid.bindOnCollide(callback);
    });
  }

  public update(deltaTime: number): void {
    if (this.isDisable) return;
    this.asteroids.forEach((asteroid) => {
      asteroid.update(deltaTime);
    });
  }

  public enable() {
    this.isDisable = false;
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].setEnabled(true);
    }
  }

  public disable() {
    this.isDisable = true;
    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].setEnabled(false);
    }
  }
}

export class Asteroid {
  private mesh: Mesh;
  private startAngle: number;
  private pivot: TransformNode;
  private speed: number;
  private radius: number;
  private height: number;
  private scale: number;
  private direction: Vector3;
  private meshCollideWith: AbstractMesh;
  private callBackCollide: any;

  constructor(
    mesh: Mesh,
    origin: Vector3,
    speed: number,
    maxDistance: number,
    height: number,
    meshCollideWith: AbstractMesh
  ) {
    this.mesh = mesh;
    this.pivot = new TransformNode("pivot");
    this.pivot.position = origin;
    this.meshCollideWith = meshCollideWith;
    this.speed = 0.05 + speed * Math.random();
    this.radius = 400 + maxDistance * Math.random();
    this.height = height * (Math.random() * 2 - 1);
    this.scale = 0.005 + Math.random() * 0.02;
    this.mesh.position = new Vector3(this.radius, this.height, 0);
    this.mesh.scaling = new Vector3(this.scale, this.scale, this.scale);
    this.startAngle = Math.random() * 2 * Math.PI;
    this.mesh.parent = this.pivot;
    this.direction = new Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );
    this.pivot.rotate(new Vector3(0, 1, 0), this.startAngle);
    this.mesh.addLODLevel(500, null);

    const subMesh = this.mesh.getChildren()[0] as AbstractMesh;
    subMesh.physicsImpostor = new PhysicsImpostor(
      subMesh,
      PhysicsImpostor.MeshImpostor,
      { mass: 0, restitution: 0.9 },
      subMesh.getScene()
    );
      subMesh.checkCollisions = true;
  }

  public bindOnCollide(callback: () => void): void {
    this.callBackCollide = callback;
  }

  public update(deltaTime: number): void {
    this.pivot.rotate(new Vector3(0, 1, 0), this.speed * deltaTime);
    this.mesh.rotate(this.direction, this.speed * deltaTime * 10);
    const subMesh = this.mesh.getChildren()[0] as Mesh;
    if (subMesh.intersectsMesh(this.meshCollideWith, true)) {
      this.callBackCollide();
    }
  }

  public setEnabled(enabled: boolean): void {
    this.mesh.setEnabled(enabled);
  }

  public get position(): Vector3 {
    return this.mesh.position;
  }
}

interface ExclusionMesh {
  mesh: Mesh;
  distance: number;
}
