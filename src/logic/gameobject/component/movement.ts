import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import MovementConfig from "../../config/component/movement";
import Time from "../../time/time";
import GameObject from "../gameObject";
import Component, { ComponentType } from "./component";

class MovementComponent extends Component {
    public onMove: (speedRate: number) => void = () => { };

    protected _config: MovementConfig;
    protected _velocity: Vector2;
    private _dashing: boolean = false;

    public input = new MovementInput();

    constructor(parent: GameObject, config: MovementConfig = null) {
        super(parent);
        this._velocity = Vector2.Zero();
        this._config = config;
    }

    public get type(): ComponentType {
        return ComponentType.Movement;
    }

    public update(): void {
        if (!this.parent.alive) {
            return;
        }
        
        const level = this._parent.level;
        if (level.isPassableTile(this._parent.position) === false) {
            console.warn("Character is not on passable tile");
            return;
        }

        this.updateMove(this.input);
        this.updateDirection();
    }

    public updateMove(input: MovementInput) {
        let axis = input.axis;
        if (axis.lengthSquared() > 1) {
            axis.normalize();
        }

        if (input.dash && !this._dashing) {
            this._dashing = true;
            input.dash = false;

            if (axis.lengthSquared() === 0) {
                const direction = this._parent.direction - Math.PI / 2;
                axis.x = Math.cos(direction);
                axis.y = Math.sin(direction);
                axis.normalize();
            }
            
            this._velocity = axis.scale(this._config.dashSpeed);
        } else {
            if (this._dashing || axis.lengthSquared() === 0) {
                this._velocity = Vector2.Lerp(this._velocity, Vector2.Zero(), (this._dashing ? this._config.dashDeceleration : this._config.deceleration) * Time.TICK_DELTA_TIME);
                if (this._dashing) {
                    this._dashing = this._velocity.lengthSquared() > this._config.speed * this._config.speed;
                }
            } else {
                this._velocity = Vector2.Lerp(this._velocity, axis.scale(this._config.speed), this._config.acceleration * Time.TICK_DELTA_TIME);
            }
        }

        const velocityAtTime = this._velocity.clone().scale(Time.TICK_DELTA_TIME);
        const level = this._parent.level;
        let newPosition = this._parent.position.add(velocityAtTime);
        if (!level.isPassableTile(newPosition)) {
            const slidePosition = newPosition.clone();
            slidePosition.x = this._parent.position.x;
            if (level.isPassableTile(slidePosition)) {
                newPosition = slidePosition;
            } else {
                slidePosition.x = newPosition.x;
                slidePosition.y = this._parent.position.y;
                if (level.isPassableTile(slidePosition)) {
                    newPosition = slidePosition;
                } else {
                    newPosition = this._parent.position;
                }

            }
        }

        this._parent.position = newPosition;

        this.onMove(this._velocity.length() / this._config.speed);
    }
    
    public updateDirection() {
        let velocity = this._velocity;
        if (velocity.lengthSquared() > 1) {
            velocity = velocity.clone().normalize();
        }
        if (velocity.lengthSquared() > 0) {
            let direction = Math.atan2(velocity.y, velocity.x);
            this.parent.direction = direction + Math.PI / 2;
        }
    }
}

class MovementInput {
    public axis: Vector2 = Vector2.Zero();
    public dash: boolean = false;
}

export default MovementComponent;
export { MovementInput };