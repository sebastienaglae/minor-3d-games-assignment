export default interface ISceneComponent {
    update(t: number): void;
    destroy(): void;
}