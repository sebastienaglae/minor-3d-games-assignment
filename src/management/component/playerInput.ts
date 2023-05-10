import { Scene } from "@babylonjs/core/scene";
import Character from "../../logic/gameobject/character";
import CombatComponent from "../../logic/gameobject/component/combat";
import MovementComponent from "../../logic/gameobject/component/movement";
import InputManager from "../inputmanager";
import ISceneComponent from "./interface";
import { Nullable } from "@babylonjs/core";

export default class PlayerInput implements ISceneComponent {
    private static readonly KEY_FORWARD: string = "z";
    private static readonly KEY_BACKWARD: string = "s";
    private static readonly KEY_LEFT: string = "q";
    private static readonly KEY_RIGHT: string = "d";

    private _character: Character;
    private _attackDirection: Nullable<number> = null;

    constructor(scene: Scene, character: Character) {
        this._character = character;
        // handle click on canvas
        scene.onPointerDown = (event, pickResult) => {
            if (pickResult.hit) {
                const from = this._character.position;
                const to = pickResult.pickedPoint;
                const direction = Math.atan2(to.x - from.x, to.z - from.y);
                this._attackDirection = -direction + Math.PI / 2;
                console.log(direction);
            }
        }
    }
    
    public destroy(): void {
        this._character = null;
    }

    public get character(): Character {
        return this._character;
    }

    public update(): void {
        const movementComponent = this._character.findComponent(MovementComponent);
        if (movementComponent) {
            const axisX = this.getKeyAxis(PlayerInput.KEY_RIGHT) - this.getKeyAxis(PlayerInput.KEY_LEFT);
            const axisY = this.getKeyAxis(PlayerInput.KEY_FORWARD) - this.getKeyAxis(PlayerInput.KEY_BACKWARD);

            const input = movementComponent.input;
            input.axis.x = axisX;
            input.axis.y = axisY;
            input.dash = input.dash || InputManager.isKeyDown("Shift", true);
        }

        if (this._attackDirection !== null) {
            const combatComponent = this._character.findComponent(CombatComponent);
            if (combatComponent && combatComponent.canAttack) {
                combatComponent.attack(this._attackDirection);
            }
            this._attackDirection = null;
        }
    }

    private getKeyAxis(key: string): number {
        return InputManager.isKeyDown(key) ? 1 : 0;
    }
}