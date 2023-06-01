import MovementConfig from "./component/movement";

export default interface Globals {
    npcMovement: MovementConfig;
    npcStartWaitingPlayerDistance: number;
    npcStartChasingPlayerDistance: number;
}