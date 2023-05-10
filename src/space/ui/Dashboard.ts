import {
  AbstractMesh,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export class Dashboard {
  private _scene: Scene;
  private spaceship: AbstractMesh;

  private _uiTexture: GUI.AdvancedDynamicTexture;
  private _screenMesh: Mesh;

  private _speedText: GUI.TextBlock;
  private _eng1Text: GUI.TextBlock;
  private _eng2Text: GUI.TextBlock;
  private _eng3Text: GUI.TextBlock;
  private _pressText: GUI.TextBlock;
  private _tempText: GUI.TextBlock;
  private _o2Text: GUI.TextBlock;
  private _timeText: GUI.TextBlock;
  private _distanceText: GUI.TextBlock;
  private _fpsText: GUI.TextBlock;
  private _planetText: GUI.TextBlock;

  constructor(scene: Scene, spaceship: AbstractMesh) {
    this._scene = scene;
    this.spaceship = spaceship;

    this._initMesh();
    this._initGUI();
  }

  private _initMesh() {
    this._screenMesh = MeshBuilder.CreatePlane(
      "screen",
      { width: 1.75, height: 1 },
      this._scene
    );
    this._screenMesh.parent = this.spaceship;
    this._screenMesh.visibility = 0.75;
    this._screenMesh.position = new Vector3(0, -0.2, 1.5);
    this._screenMesh.rotation = new Vector3(0.53, 0, 0);
  }

  private _initGUI() {
    this._uiTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
      this._screenMesh,
      2048,
      1170,
      false
    );
    this._uiTexture.background = "transparent";
    this._uiTexture
      .parseFromURLAsync("assets/space/ui/FullDashboard.json")
      .then(() => {
        // let material = ToonMaterial.createMaterial(this._uiTexture);

        // this._screenMesh.material = material;
        //Standard mat
        let material = new StandardMaterial("mat", this._scene);
        material.diffuseTexture = this._uiTexture;
        material.backFaceCulling = false;
        this._grabElement();
      });
  }
  private _grabElement() {
    this._speedText = this._uiTexture.getControlByName(
      "SPEED"
    ) as GUI.TextBlock;
    this._eng1Text = this._uiTexture.getControlByName("ENG_1") as GUI.TextBlock;
    this._eng2Text = this._uiTexture.getControlByName("ENG_2") as GUI.TextBlock;
    this._eng3Text = this._uiTexture.getControlByName("ENG_3") as GUI.TextBlock;
    this._pressText = this._uiTexture.getControlByName(
      "PRESS"
    ) as GUI.TextBlock;
    this._tempText = this._uiTexture.getControlByName("TEMP") as GUI.TextBlock;
    this._o2Text = this._uiTexture.getControlByName("O2") as GUI.TextBlock;
    this._timeText = this._uiTexture.getControlByName("TIME") as GUI.TextBlock;
    this._distanceText = this._uiTexture.getControlByName(
      "DISTANCE"
    ) as GUI.TextBlock;
    this._fpsText = this._uiTexture.getControlByName("FPS") as GUI.TextBlock;
    this._planetText = this._uiTexture.getControlByName(
      "PLANET"
    ) as GUI.TextBlock;
  }

  public setSpeedText(speed: number) {
    if (!this._speedText) return;

    this._speedText.text = speed.toFixed(0);
  }

  public setEng1Text(percent: number) {
    if (!this._eng1Text) return;
    this._eng1Text.text = percent.toFixed(0) + "%";
  }

  public setEng2Text(percent: number) {
    if (!this._eng2Text) return;
    this._eng2Text.text = percent.toFixed(0) + "%";
  }

  public setEng3Text(percent: number) {
    if (!this._eng3Text) return;
    this._eng3Text.text = percent.toFixed(0) + "%";
  }

  public setAllEngText(percent: number) {
    this.setEng1Text(percent);
    this.setEng2Text(percent);
    this.setEng3Text(percent);
  }

  public setPressText(press: number) {
    if (!this._pressText) return;
    this._pressText.text = press.toFixed(0) + "hPa";
  }

  public setTempText(temp: number) {
    if (!this._tempText) return;
    this._tempText.text = temp.toFixed(0) + "°C";
  }

  public setO2Text(o2: number) {
    if (!this._o2Text) return;
    this._o2Text.text = o2.toFixed(0) + "%";
  }

  public updateTime() {
    if (!this._timeText) return;
    let time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    this._timeText.text =
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds);
  }

  public setDistanceText(distance: number) {
    if (!this._distanceText) return;
    this._distanceText.text = distance.toFixed(0) + "km restant";
  }

  public updateFPSText() {
    if (!this._fpsText) return;
    let fps = this._scene.getEngine().getFps();
    this._fpsText.text = fps.toFixed(0) + "fps";
  }

  public setPlanetText(planet: string) {
    if (!this._planetText) return;
    this._planetText.text = planet;
  }
}
