import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";

import { Engine } from "@babylonjs/core/Engines/engine"
import WorldScene from "./scenes/world";
import SpaceScene from './scenes/space';
import { WebGPUEngine } from '@babylonjs/core';

// const view = document.getElementById("view") as HTMLCanvasElement;
// const engine = new Engine(view, true);
// const scene = new WorldScene(engine);

// scene.init().then(() => {
//     engine.runRenderLoop(() => {
//         scene.update();
//     });
// });

async function init() {
  const view = document.getElementById("view") as HTMLCanvasElement;
  const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
  let engine;
  if (webGPUSupported) {
    engine = new WebGPUEngine(view);
    await engine.initAsync();
  } else {
    engine = new Engine(view, true);
  }

  const scene = new SpaceScene(engine);
  scene.init().then(() => {
    engine.runRenderLoop(() => {
      const currentScene = engine.scenes[0];
      if (currentScene) {
        currentScene.update();
      }
    });
  });
}

init();