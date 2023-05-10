export class Utils {
  public static clamp(min: number, max: number, value: number) {
    let clmp = (value - min) / (max - min);
    return Math.min(Math.max(clmp, 0), 1);
  }
}
