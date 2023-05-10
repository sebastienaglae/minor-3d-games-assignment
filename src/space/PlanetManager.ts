import { AbstractMesh, Scene, Texture, Vector3 } from "@babylonjs/core";
import { Planet } from "./Planet";

export class PlanetManager {
  private _planets: Planet[];
  private _scale: number = 1 / 200;
  private _scene: Scene;
  constructor(scene: Scene) {
    this._scene = scene;
    this._planets = [];
    let mercury = new Planet(
      "mercury",
      2000 / 4,
      0.0004,
      0.00001,
      4879 * this._scale,
      new Texture("assets/space/img/planets/2k_mercury.jpg", scene)
    );
    let venus = new Planet(
      "venus",
      3500 / 4,
      0.0035,
      0.00001,
      12104 * this._scale,
      new Texture("assets/space/img/planets/2k_venus_surface.jpg", scene)
    );
    let earth = new Planet(
      "earth",
      5000 / 4,
      0.003,
      0.00001,
      12742 * this._scale,
      new Texture("assets/space/img/planets/2k_earth_daymap.jpg", scene)
    );
    let mars = new Planet(
      "mars",
      7500 / 4,
      0.0024,
      0.00001,
      6779 * this._scale,
      new Texture("assets/space/img/planets/2k_mars.jpg", scene)
    );
    let jupiter = new Planet(
      "jupiter",
      10000 / 4,
      0.0013,
      0.00001,
      139820 * this._scale,
      new Texture("assets/space/img/planets/2k_jupiter.jpg", scene)
    );
    let saturn = new Planet(
      "saturn",
      12500 / 4,
      0.009,
      0.00001,
      116460 * this._scale,
      new Texture("assets/space/img/planets/2k_saturn.jpg", scene)
    );
    let uranus = new Planet(
      "uranus",
      15000 / 4,
      0.0007,
      0.00001,
      50724 * this._scale,
      new Texture("assets/space/img/planets/2k_uranus.jpg", scene)
    );
    let neptune = new Planet(
      "neptune",
      17500 / 4,
      0.0005,
      0.00001,
      49244 * this._scale,
      new Texture("assets/space/img/planets/2k_neptune.jpg", scene)
    );
    let pluto = new Planet(
      "pluto",
      20000 / 4,
      0.0004,
      0.00001,
      2376 * this._scale,
      new Texture("assets/space/img/planets/2k_haumea_fictional.jpg", scene)
    );

    this._planets.push(
      mercury,
      venus,
      earth,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      pluto
    );
  }

  public createMeshes() {
    this._planets.forEach((planet) => {
      planet.createMeshes(this._scene);
    });
  }

  public getPlanets() {
    return this._planets;
  }

  public update(deltaTime) {
    this._planets.forEach((planet) => {
      planet.update(deltaTime);
    });
  }

  public getDistanceClosestPlanet(mesh: AbstractMesh): {
    planet: Planet;
    distance: number;
  } {
    let distance = Number.MAX_VALUE;
    let planet = null;
    this._planets.forEach((p) => {
      let d = Vector3.Distance(mesh.position, p.getMesh().position) - p.getRadius();
      if (d < distance) {
        distance = d;
        planet = p;
      }
    });
    return { planet: planet, distance: distance };
  }

  public disposeAll() {
    this._planets.forEach((planet) => {
      planet.dispose();
    });
  }
}
