import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene as BScene } from "@babylonjs/core/scene";
import ISceneComponent from "../management/component/interface";
import InputManager from "../management/inputmanager";
import MeshProvider from "../management/meshprovider";

export default abstract class Scene extends BScene {
  private _sceneComponents: ISceneComponent[] = [];

  constructor(engine: Engine) {
    super(engine);
  }

  public async init(): Promise<void> {
    await this.whenReadyAsync();
    window.addEventListener("resize", () => {
      this.getEngine().resize();
    });
    MeshProvider.activeScene = this;
  }

  public update() {
    this.render();

    const t = this.getEngine().getDeltaTime() / 1000;
    this._sceneComponents.forEach((component) => component.update(t));

    InputManager.init(this);
    MeshProvider.instance.executeQueue();
  }

  public destroy() {
    this._sceneComponents.forEach((component) => component.destroy());
    this._sceneComponents = [];
  }

  public addComponent(component: ISceneComponent) {
    this._sceneComponents.push(component);
  }

  public getComponent<T extends ISceneComponent>(type: new (...args: any[]) => T): T {
    return this._sceneComponents.find((component) => component instanceof type) as T;
  }
}
