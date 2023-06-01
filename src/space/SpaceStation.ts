import {
  AbstractMesh,
  Mesh,
  PhysicsImpostor,
  Scene,
  SceneLoader,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { FirstPersonPlayer } from "./Player";
import Door, { DoorAxis } from "./Door";

export class SpaceStation {
  private _scene: Scene;
  private _collider: AbstractMesh;
  private _spaceStation: AbstractMesh;
  private _player: FirstPersonPlayer;
  private _doors: Door[] = [];
  private _distanceToOpenDoor = 12;
  private _spaceStationEnabled = false;

  constructor(scene) {
    this._scene = scene;
  }

  public async init() {
    await this._setupCollider();
    await this._setupSpaceStation();
    await this._setupPlayer();
    await this._setupDoor();

    this._scene.registerBeforeRender(() => {
      this._update();
    });
  }

  private async _setupCollider() {
    var spaceStationColliderResult = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "collider.glb",
      this._scene
    );
    this._collider = spaceStationColliderResult.meshes[0];
    this._collider.position = new Vector3(0, 0, 0);
    spaceStationColliderResult.meshes.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, restitution: 0 },
        this._scene
      );
      mesh.checkCollisions = true;
      mesh.isVisible = false;
      mesh.freezeWorldMatrix();
    });
    this._collider.freezeWorldMatrix();
  }

  private async _setupSpaceStation() {
    var spaceStation = await SceneLoader.ImportMeshAsync(
      "",
      "assets/space/obj/",
      "SpaceBase.glb",
      this._scene
    );

    this._spaceStation = spaceStation.meshes[0];
    this._spaceStation.getChildMeshes().forEach((mesh) => {
      if (mesh.name.includes("SpaceBase (1)")) {
        mesh.freezeWorldMatrix();
        mesh.material.freeze();
      }
    });
  }

  private async _setupPlayer() {
    this._player = new FirstPersonPlayer(
      this._scene,
      new Vector3(-124.8, 0.55, 179.6)
    );
  }

  private async _setupDoor() {
    let door0 = new Door(
      this._getNodeById("HorizontalRectangleDoor", this._spaceStation),
      0.5,
      DoorAxis.Z
    );

    let door1 = new Door(
      this._getNodeById("MainDoor", this._spaceStation),
      15,
      DoorAxis.Y
    );

    let door2 = new Door(
      this._getNodeById("RoundDoor", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door3 = new Door(
      this._getNodeById("RoundDoor.001", this._spaceStation),
      -2.2,
      DoorAxis.X
    );

    let door4 = new Door(
      this._getNodeById("RoundDoor.002", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door5 = new Door(
      this._getNodeById("RoundDoor.003", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door6 = new Door(
      this._getNodeById("RoundDoor.004", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door7 = new Door(
      this._getNodeById("RoundDoor.005", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door8 = new Door(
      this._getNodeById("RoundDoor.006", this._spaceStation),
      2.2,
      DoorAxis.X
    );

    let door9 = new Door(
      this._getNodeById("VerticalRectangleDoor", this._spaceStation),
      7.67,
      DoorAxis.Z
    );

    this._doors.push(
      door0,
      door1,
      door2,
      door3,
      door4,
      door5,
      door6,
      door7,
      door8,
      door9
    );
  }

  public enterStation() {
    this._spaceStationEnabled = true;
    this._player.spawn();
  }

  public exitStation() {
    this._spaceStationEnabled = false;
    this._player.dispawn();
  }

  private _getNodeById(id: string, parent: TransformNode): TransformNode {
    if (parent.id === id) {
      return parent;
    }
    for (let i = 0; i < parent.getChildren().length; i++) {
      let node = parent.getChildren()[i];
      if (node.id === id) {
        return node as TransformNode;
      }
      if (node.getChildren().length > 0) {
        let result = this._getNodeById(id, node as TransformNode);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  private _update() {
    if (!this._spaceStationEnabled) return;
    this._updateDoor();
  }

  private _updateDoor() {
    let nearestDoor = this._getNearestDoor();
    this._doors.forEach((door) => {
      if (door === nearestDoor) {
        door.open();
      } else {
        door.close();
      }
    });
  }

  public getCamera() {
    return this._player.getCamera();
  }

  private _getNearestDoor(): Door {
    let nearestDoor = null;
    let nearestDistance = Number.MAX_VALUE;
    this._doors.forEach((door) => {
      let distance = Vector3.Distance(
        door.getDoorPosition(),
        this._player.position
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestDoor = door;
      }
    });
    if (nearestDistance > this._distanceToOpenDoor) {
      return null;
    }
    return nearestDoor;
  }

  public getPlayerMesh(): Mesh {
    return this._player.getPlayerMesh();
  }
}
