import MovementConfig from "./component/movement";
import ChestConfig from "./gameobject/chest";

export default interface Globals {
    npcMovement: MovementConfig;
    npcPatrolMovement: MovementConfig;
    npcStartWaitingPlayerDistance: number;
    npcStartChasingPlayerDistance: number;
    chest: ChestConfig;
}