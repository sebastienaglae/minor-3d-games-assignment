import { TransformNode, Vector3 } from "@babylonjs/core";
import * as TWEEN from "tween.js";

export default class Door {
  private _transformNode: TransformNode;
  private _maxTravelDistance: number;
  private doors: TransformNode[] = [];
  private initialPositions: Vector3[] = [];
  private isOpening: boolean = false;
  private isClosing: boolean = false;
  private doorsTween: TWEEN.Tween[] = [];
  private trigger: Vector3;
  private axis: DoorAxis;

  constructor(
    transformNode: TransformNode,
    maxPosition: number,
    axis: DoorAxis
  ) {
    this._maxTravelDistance = maxPosition;
    this._transformNode = transformNode;
    this.axis = axis;
    this.doors.push(this._transformNode.getChildren()[0] as TransformNode);
    this.initialPositions.push(this.doors[0].position.clone());
    if (this.axis !== DoorAxis.Y) {
      this.doors.push(this._transformNode.getChildren()[1] as TransformNode);
      this.initialPositions.push(this.doors[1].position.clone());
    }
    this.trigger = this.doors[0].absolutePosition.clone();
  }

  private stopAllTweens() {
    this.doorsTween.forEach((tween) => {
      tween.stop();
    });
    this.doorsTween = [];
  }

  public open(): void {
    if (this.isOpening) {
      return;
    }
    this.stopAllTweens();
    this.isOpening = true;
    this.isClosing = false;

    if (this.axis === DoorAxis.Z) {
      this.openZ();
    } else if (this.axis === DoorAxis.Y) {
      this.openY();
    } else if (this.axis === DoorAxis.X) {
      this.openX();
    }
  }

  protected openZ(): void {
    const door1TargetZ = this.initialPositions[0].z + this._maxTravelDistance;
    const door2TargetZ = this.initialPositions[1].z - this._maxTravelDistance;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ z: door1TargetZ }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.isOpening = false;
      });

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ z: door2TargetZ }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out);

    this.doorsTween.push(door1Tween);
    this.doorsTween.push(door2Tween);

    door1Tween.start();
    door2Tween.start();
  }

  protected openY(): void {
    const door1TargetY = this.initialPositions[0].y + this._maxTravelDistance;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ y: door1TargetY }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)

      .onComplete(() => {
        this.isOpening = false;
      });

    this.doorsTween.push(door1Tween);

    door1Tween.start();
  }

  protected openX(): void {
    const door1TargetX = this.initialPositions[0].x + this._maxTravelDistance;
    const door2TargetX = this.initialPositions[1].x - this._maxTravelDistance;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ x: door1TargetX }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.isOpening = false;
      });

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ x: door2TargetX }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out);

    this.doorsTween.push(door1Tween);
    this.doorsTween.push(door2Tween);

    door1Tween.start();
    door2Tween.start();
  }

  public close(): void {
    if (this.isClosing) {
      return;
    }
    this.stopAllTweens();
    this.isOpening = false;
    this.isClosing = true;

    if (this.axis === DoorAxis.Z) {
      this.closeZ();
    } else if (this.axis === DoorAxis.Y) {
      this.closeY();
    } else if (this.axis === DoorAxis.X) {
      this.closeX();
    }
  }

  protected closeZ(): void {
    const door1TargetZ = this.initialPositions[0].z;
    const door2TargetZ = this.initialPositions[1].z;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ z: door1TargetZ }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.isClosing = false;
      });

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ z: door2TargetZ }, 500)
      .easing(TWEEN.Easing.Quadratic.In);

    door1Tween.start();
    door2Tween.start();
  }

  protected closeY(): void {
    const door1TargetY = this.initialPositions[0].y;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)
      .to({ y: door1TargetY }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.isClosing = false;
      });

    this.doorsTween.push(door1Tween);

    door1Tween.start();
  }

  protected closeX(): void {
    const door1TargetX = this.initialPositions[0].x;
    const door2TargetX = this.initialPositions[1].x;

    const door1Tween = new TWEEN.Tween(this.doors[0].position)

      .to({ x: door1TargetX }, 500)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        this.isClosing = false;
      });

    const door2Tween = new TWEEN.Tween(this.doors[1].position)
      .to({ x: door2TargetX }, 500)
      .easing(TWEEN.Easing.Quadratic.In);
    this.doorsTween.push(door1Tween);
    this.doorsTween.push(door2Tween);

    door1Tween.start();
    door2Tween.start();
  }

  public toggleDoors(): void {
    if (this.isOpening) {
      console.log("close");
      this.close();
    } else {
      console.log("open");
      this.open();
    }
  }

  public getDoorPosition() {
    return this.trigger;
  }
}

export enum DoorAxis {
  X,
  Y,
  Z,
}
