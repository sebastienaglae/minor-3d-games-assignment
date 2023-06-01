import SceneConfig from "../../logic/config/scene";
import Level from "../../logic/level/level";
import ISceneComponent from "./interface";

// use pako instead of zlib
import * as zlib from "pako";

export default class TilemapLoaderComponent implements ISceneComponent {
    private _level: Level;
    private _sceneConfig: SceneConfig;

    constructor(sceneConfig: SceneConfig, level: Level) {
        this._level = level;
        this._sceneConfig = sceneConfig;
    }

    public async loadAsync(): Promise<void> {
        console.log("Loading tilemap");
        
        const path = "assets/scenes/" + this._sceneConfig.name + "/tilemap.bin";
        const response = await fetch(path);
        const buffer = await response.arrayBuffer();
        const data = new Uint8Array(buffer);
        
        const header = data.slice(0, 5);
        const compressedTiles = data.slice(5, data.length - 2);
        const trailer = data.slice(data.length - 2);

        const magic = trailer[0] | (trailer[1] << 8);
        if (magic !== 0xFFFE) {
            throw new Error("Invalid tilemap magic");
        }
        
        const tileBuffer = zlib.ungzip(compressedTiles);

        const sizeX = header[0] | (header[1] << 8);
        const sizeY = header[2] | (header[3] << 8);
        const precision = header[4];

        if (tileBuffer.length !== sizeX * sizeY) {
            throw new Error("Invalid tilemap size: " + tileBuffer.length + " vs " + sizeX * sizeY);
        }

        this._level.tileMap.setSubTiles(tileBuffer, sizeX, sizeY, precision);
    }


    update(t: number): void {
        
    }
    destroy(): void {
        
    }
}