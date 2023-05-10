import { Color4 } from "@babylonjs/core";
import { ColorTheme } from "./ColorTheme";

export class ColorFactory {
  public static yellow() {
    return new ColorTheme(
      new Color4(1, 1, 0.7, 1.0),
      new Color4(1, 1, 0.2, 1.0),
      new Color4(0.2, 0.2, 0, 0.4)
    );
  }

  public static purple() {
    return new ColorTheme(
      new Color4(0.9, 0, 0.7, 1.0),
      new Color4(0.7, 0, 1, 1.0),
      new Color4(0.6, 0, 0.26, 0.4)
    );
  }
}
