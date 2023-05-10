import { Scene } from "@babylonjs/core/scene"
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial"
import { Effect } from "@babylonjs/core/Materials/effect"

import * as toonVertexShader from "./Shaders/Sample/toon.vertex.glsl"
import * as toonFragmentShader from "./Shaders/Sample/toon.fragment.glsl"

Effect.ShadersStore["toonVertexShader"] = toonVertexShader
Effect.ShadersStore["toonFragmentShader"] = toonFragmentShader

export class ToonMaterial extends ShaderMaterial {

    constructor(name: string, scene: Scene) {
        super(name, scene, { vertex: "toon", fragment: "toon" }, {
            uniforms: [
                "worldViewProjection",
                "time"
            ],
            attributes: [
                "position",
                "normal",
                "uv"
            ],
        })

        const startTime = Date.now()

        scene.registerBeforeRender(() => {
            const currentTime = Date.now()
            const time = currentTime - startTime

            this.time = time / 1000
        })
    }

    set time(value: number) {
        this.setFloat("time", value)
    }
}
