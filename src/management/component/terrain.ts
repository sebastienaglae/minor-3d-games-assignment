import { AbstractMesh, Matrix, Mesh, MeshBuilder, Nullable, Ray, Vector2, Vector3 } from "@babylonjs/core";
import { TileState } from "../../logic/level/tilemap";
import WorldScene from "../../scenes/world";
import ISceneComponent from "./interface";

export default class TerrainComponent implements ISceneComponent {
    private _scene: WorldScene;
    private _root: Mesh;

    constructor(scene: WorldScene, root: Mesh) {
        this._scene = scene;
        this._root = root;
        this._root.bakeCurrentTransformIntoVertices(true);
        this._root.computeWorldMatrix(true);

        const children = this._root.getChildMeshes();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.computeWorldMatrix(true);
            child.refreshBoundingInfo();
        }

        this.computePassableTiles();
    }

    private computePassableTiles(): void {
        const level = this._scene.level;
        const subSize = level.size.scale(level.resolution);
        const resolution = level.resolution;

        const children = this._root.getChildMeshes();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (this.isPassableMesh(child)) {
                // ignore ground
                continue;
            }

            const boundingInfo = child.getBoundingInfo();
            const min = boundingInfo.boundingBox.minimumWorld;
            const max = boundingInfo.boundingBox.maximumWorld;
            const minTile = new Vector2(Math.floor(min.x * resolution), Math.floor(min.z * resolution));
            const maxTile = new Vector2(Math.ceil(max.x * resolution), Math.ceil(max.z * resolution));
            const tileState = this.getMeshTileType(child);

            minTile.x = TerrainComponent.clamp(minTile.x, 0, subSize.x - 1);
            minTile.y = TerrainComponent.clamp(minTile.y, 0, subSize.y - 1);
            maxTile.x = TerrainComponent.clamp(maxTile.x, 0, subSize.x - 1);
            maxTile.y = TerrainComponent.clamp(maxTile.y, 0, subSize.y - 1);

            for (let x = minTile.x; x < maxTile.x; x++) {
                for (let y = minTile.y; y < maxTile.y; y++) {
                    if (!TerrainComponent.insideMesh(child, x / resolution, y / resolution)) {
                        continue;
                    }

                    const currentFlag = level.tileMap.getSubTile(x, y);
                    level.tileMap.setSubTile(x, y, currentFlag | tileState);
                }
            }
        }

        level.tileMap.updatePathFinder();

        this.dump();
    }

    private isPassableMesh(mesh: AbstractMesh): boolean {
        return this.getMeshTileType(mesh) === TileState.None;
    }

    private getMeshTileType(mesh: AbstractMesh): TileState {
        if (mesh.name.startsWith('Terrain')) {
            return TileState.Terrain;
        }
        if (mesh.name.startsWith('Water')) {
            return TileState.Water;
        }
        if (mesh.name.startsWith('Passable')) {
            return TileState.None;
        }
        return TileState.Object;
    }

    public update(t: number): void {
        // nothing to do
    }

    public destroy(): void {
        this._root.dispose();
    }

    public dump(): void {
        const level = this._scene.level;
        const resolution = level.resolution;
        const tileMap = level.tileMap;

        const subSizeX = level.size.x * resolution;
        const subSizeY = level.size.y * resolution;
        
        let sb = "";
        for (let y = subSizeY; y >= 0; y--) {
            sb += y + ' ';
            for (let x = 0; x < subSizeX; x++) {
                const s = tileMap.getSubTile(x, y);

                const hasObject = (s & TileState.Object) !== 0;
                const hasTerrain = (s & TileState.Terrain) !== 0;
                const hasWater = (s & TileState.Water) !== 0;

                if (hasObject) {
                    sb += 'O';
                } else if (hasTerrain) {
                    sb += ' ';
                } else if (hasWater) {
                    sb += 'W';
                } else {
                    sb += ' ';
                }
            }
            sb += '\r\n';
        }

        // download the file
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sb));
        element.setAttribute('download', 'map.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    private static clamp(value: number, min: number, max: number): number {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    private static insideMesh(mesh: AbstractMesh, x: number, y: number): boolean {
        const point = new Vector3(x, -2, y);
        const ray = new Ray(point, Vector3.Up(), 4);
        const hit = ray.intersectsMesh(mesh, false);

        return hit !== null && hit.hit;
    }
}