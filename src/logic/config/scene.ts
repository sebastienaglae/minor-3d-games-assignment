import { GameObjectType } from "../gameobject/gameObject";
import Config from "./config";

export default interface SceneConfig extends Config {
    width: number;
    height: number;
    precision: number;
    useBakedTilemap: boolean;
    models: SceneModel[];
    objects: SceneObject[];
    points: ScenePoint[];
}

export interface SceneModel {
    path: string;
    position: {
        x: number;
        y: number;
        z: number;
    }
    rotation: {
        x: number;
        y: number;
        z: number;
    }
    scale: {
        x: number;
        y: number;
        z: number;
    }
}

export interface SceneObject {
    id: number;
    name: string;
    position: {
        x: number;
        y: number;
    }
    direction: number;
    type: GameObjectType;
    params: any;
}

export interface ScenePoint {
    id: number;
    position: {
        x: number;
        y: number;
    }
}