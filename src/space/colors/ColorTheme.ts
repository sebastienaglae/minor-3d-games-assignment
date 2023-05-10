import { Color4 } from "@babylonjs/core";

export class ColorTheme {
  private _color1: Color4;
  private _color2: Color4;
  private _color3: Color4;

  constructor(color1: Color4, color2: Color4, color3: Color4) {
    this._color1 = color1;
    this._color2 = color2;
    this._color3 = color3;
  }

  public get color1(): Color4 {
    return this._color1;
  }

  public get color2(): Color4 {
    return this._color2;
  }

  public get color3(): Color4 {
    return this._color3;
  }
}
