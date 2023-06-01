import { ISceneLoaderAsyncResult, Scene, SceneLoader } from "@babylonjs/core";

export default class MeshProvider {
    public static instance = new MeshProvider();
    public static activeScene: Scene;

    private _queue: MeshAsyncHandle[] = [];
    private _nextId: number = 0;

    private _pendingPromises: Promise<void>[] = [];

    public load(path: string): MeshAsyncHandle {
        const handle = new MeshAsyncHandle(this._nextId++, path);
        this._queue.push(handle);
        return handle;
    }
    public executeQueue(): void {
        if (this._queue.length === 0) {
            return;
        }

        console.log(`Loading ${this._queue.length} meshes...`);

        for (const handle of this._queue) {
            const promise = SceneLoader.ImportMeshAsync(null, "assets/" + handle.path, null, MeshProvider.activeScene).then((result) => {
                handle.result = result;
            });
            this._pendingPromises.push(promise.then(() => {
                this._pendingPromises.splice(this._pendingPromises.indexOf(promise), 1);
            }));
        }
        this._queue = [];
    }

    public executeAsync(): Promise<void> {
        this.executeQueue();
        
        return Promise.all(this._pendingPromises).then(() => {
            console.log("All meshes loaded");
        });
    }
}

export class MeshAsyncHandle {
    private _id: number;
    private _path: string;

    private _result: ISceneLoaderAsyncResult;
    private _isLoaded: boolean;
    private _isDisposed: boolean;
    private _onLoaded: (result: ISceneLoaderAsyncResult) => void = (mesh) => { };
    private _onDisposed: () => void = () => { };

    public constructor(id: number, path: string) {
        this._id = id;
        this._path = path;
        this._isLoaded = false;
        this._isDisposed = false;
    }

    public get id(): number {
        return this._id;
    }

    public get path(): string {
        return this._path;
    }
    
    public get mesh(): ISceneLoaderAsyncResult {
        return this._result;
    }

    public get isLoaded(): boolean {
        return this._isLoaded;
    }

    public set result(value: ISceneLoaderAsyncResult) {
        if (this._isDisposed) {
            for (const mesh of value.meshes) {
                mesh.dispose();
            }
            return;
        }

        this._result = value;
        this._isLoaded = true;
        this._onLoaded(this._result);
    }

    public get onLoaded(): (result: ISceneLoaderAsyncResult) => void {
        return this._onLoaded;
    }
    public set onLoaded(value: (result: ISceneLoaderAsyncResult) => void) {
        this._onLoaded = value;
        if (this._isLoaded) {
            this._onLoaded(this._result);
        }
    }

    public get onDisposed(): () => void {
        return this._onDisposed;
    }
    public set onDisposed(value: () => void) {
        this._onDisposed = value;
        if (this._isDisposed) {
            this._onDisposed();
        }
    }

    public dispose(): void {
        this._isDisposed = true;
        if (this._result) {
            for (const mesh of this._result.meshes) {
                mesh.dispose();
            }
            this._onDisposed();
            this._result = null;
        }
    }
}