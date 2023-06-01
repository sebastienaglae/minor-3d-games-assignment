import { Mesh, MeshBuilder, Scene, Texture } from "@babylonjs/core";
import { ToonMaterial } from "./materials/ToonMaterial";

export class Planet {
  private readonly _name: string;
  private readonly _orbitRadius: number;
  private readonly _orbitSpeed: number;
  private readonly _rotationSpeed: number;
  private readonly _diameter: number;
  private readonly _texture: Texture;
  private _orbitMesh: Mesh | undefined;
  private _planetMesh: Mesh | undefined;

  constructor(
    name: string,
    orbitRadius: number,
    orbitSpeed: number,
    rotationSpeed: number,
    diameter: number,
    texture: Texture
  ) {
    this._name = name;
    this._orbitRadius = orbitRadius;
    this._orbitSpeed = orbitSpeed;
    this._rotationSpeed = rotationSpeed;
    this._diameter = diameter;
    this._texture = texture;
  }

  public createMeshes(scene: Scene): void {
    const orbit = MeshBuilder.CreateTorus(
      `${this._name}-orbit`,
      {
        diameter: this._orbitRadius * 2,
        thickness: 0.01,
      },
      scene
    );
    this._orbitMesh = orbit;
    this._orbitMesh.visibility = 0.1;

    const planet = MeshBuilder.CreateSphere(
      `${this._name}-planet`,
      {
        diameter: this._diameter,
      },
      scene
    );
    planet.material = ToonMaterial.createMaterial(this._texture);
    planet.material.freeze();


    this._planetMesh = planet;
  }

  public update(deltaTime: number): void {
    if (this._orbitMesh && this._planetMesh) {
      this._planetMesh.rotation.y += deltaTime * this._rotationSpeed;
      this._planetMesh.position.x =
        this._orbitRadius * Math.cos((Date.now() / 1000) * this._orbitSpeed);
      this._planetMesh.position.z =
        this._orbitRadius * Math.sin((Date.now() / 1000) * this._orbitSpeed);
    }
  }

  public getMesh() {
    return this._planetMesh;
  }

  public getRadius() {
    return this._diameter / 2;
  }

  public dispose() {
    if (this._orbitMesh) {
      this._orbitMesh.dispose();
    }
    if (this._planetMesh) {
      this._planetMesh.dispose();
    }
  }

  public getName() {
    return this._name;
  }

  public getAtmosphereRadius() {
    return this._diameter / 2 + this._diameter * 0.1;
  }
}
