import { Color3 } from "@babylonjs/core";
import {
  AddBlock,
  AnimatedInputBlockTypes,
  BaseTexture,
  DotBlock,
  FragmentOutputBlock,
  ImageSourceBlock,
  InputBlock,
  LightInformationBlock,
  MultiplyBlock,
  NodeMaterial,
  NodeMaterialSystemValues,
  NormalizeBlock,
  OneMinusBlock,
  PowBlock,
  ScaleBlock,
  StepBlock,
  Texture,
  TextureBlock,
  TransformBlock,
  VectorSplitterBlock,
  VertexOutputBlock,
  ViewDirectionBlock,
} from "@babylonjs/core/Materials";

export class ToonMaterial {
  public static createMaterial(inputTexture: any) {
    let nodeMaterial = new NodeMaterial("Toon");
    // InputBlock
    var position = new InputBlock("position");
    position.visibleInInspector = false;
    position.visibleOnFrame = false;
    position.target = 1;
    position.setAsAttribute("position");

    // TransformBlock
    var worldPos = new TransformBlock("worldPos");
    worldPos.visibleInInspector = false;
    worldPos.visibleOnFrame = false;
    worldPos.target = 1;
    worldPos.complementZ = 0;
    worldPos.complementW = 1;

    // InputBlock
    var world = new InputBlock("world");
    world.visibleInInspector = false;
    world.visibleOnFrame = false;
    world.target = 1;
    world.setAsSystemValue(NodeMaterialSystemValues.World);

    // TransformBlock
    var Worldnormal = new TransformBlock("World normal");
    Worldnormal.visibleInInspector = false;
    Worldnormal.visibleOnFrame = false;
    Worldnormal.target = 1;
    Worldnormal.complementZ = 0;
    Worldnormal.complementW = 0;

    // InputBlock
    var normal = new InputBlock("normal");
    normal.visibleInInspector = false;
    normal.visibleOnFrame = false;
    normal.target = 1;
    normal.setAsAttribute("normal");

    // VectorSplitterBlock
    var N = new VectorSplitterBlock("N");
    N.visibleInInspector = false;
    N.visibleOnFrame = false;
    N.target = 4;

    // NormalizeBlock
    var NNormalized = new NormalizeBlock("N (Normalized)");
    NNormalized.visibleInInspector = false;
    NNormalized.visibleOnFrame = false;
    NNormalized.target = 4;

    // DotBlock
    var NDotLDiffuseLightIntensity = new DotBlock(
      "N Dot L (Diffuse Light Intensity)"
    );
    NDotLDiffuseLightIntensity.visibleInInspector = false;
    NDotLDiffuseLightIntensity.visibleOnFrame = false;
    NDotLDiffuseLightIntensity.target = 4;

    // NormalizeBlock
    var LNormalized = new NormalizeBlock("L (Normalized)");
    LNormalized.visibleInInspector = false;
    LNormalized.visibleOnFrame = false;
    LNormalized.target = 4;

    // LightInformationBlock
    var Lightinformation = new LightInformationBlock("Light information");
    Lightinformation.visibleInInspector = false;
    Lightinformation.visibleOnFrame = false;
    Lightinformation.target = 1;

    // AddBlock
    var H = new AddBlock("H");
    H.visibleInInspector = false;
    H.visibleOnFrame = false;
    H.target = 4;

    // NormalizeBlock
    var VNormalized = new NormalizeBlock("V (Normalized)");
    VNormalized.visibleInInspector = false;
    VNormalized.visibleOnFrame = false;
    VNormalized.target = 4;

    // ViewDirectionBlock
    var Viewdirection = new ViewDirectionBlock("View direction");
    Viewdirection.visibleInInspector = false;
    Viewdirection.visibleOnFrame = false;
    Viewdirection.target = 4;

    // InputBlock
    var cameraPosition = new InputBlock("cameraPosition");
    cameraPosition.visibleInInspector = false;
    cameraPosition.visibleOnFrame = false;
    cameraPosition.target = 1;
    cameraPosition.setAsSystemValue(NodeMaterialSystemValues.CameraPosition);

    // DotBlock
    var NDotV = new DotBlock("N Dot V");
    NDotV.visibleInInspector = false;
    NDotV.visibleOnFrame = false;
    NDotV.target = 4;

    // OneMinusBlock
    var NDotV1 = new OneMinusBlock("1 - N Dot V");
    NDotV1.visibleInInspector = false;
    NDotV1.visibleOnFrame = false;
    NDotV1.target = 4;

    // MultiplyBlock
    var RimINtensity = new MultiplyBlock("Rim INtensity");
    RimINtensity.visibleInInspector = false;
    RimINtensity.visibleOnFrame = false;
    RimINtensity.target = 4;

    // PowBlock
    var RimFactor = new PowBlock("Rim Factor");
    RimFactor.visibleInInspector = false;
    RimFactor.visibleOnFrame = false;
    RimFactor.target = 4;

    // InputBlock
    var RimIntensity = new InputBlock("Rim Intensity");
    RimIntensity.visibleInInspector = false;
    RimIntensity.visibleOnFrame = false;
    RimIntensity.target = 1;
    RimIntensity.value = 0.4;
    RimIntensity.min = 0;
    RimIntensity.max = 0;
    RimIntensity.isBoolean = false;
    RimIntensity.matrixMode = 0;
    RimIntensity.animationType = AnimatedInputBlockTypes.None;
    RimIntensity.isConstant = false;

    // StepBlock
    var QuantizedRimLightIntensity = new StepBlock(
      "Quantized Rim Light Intensity"
    );
    QuantizedRimLightIntensity.visibleInInspector = false;
    QuantizedRimLightIntensity.visibleOnFrame = false;
    QuantizedRimLightIntensity.target = 4;

    // InputBlock
    var RimCutoff = new InputBlock("Rim Cutoff");
    RimCutoff.visibleInInspector = false;
    RimCutoff.visibleOnFrame = false;
    RimCutoff.target = 1;
    RimCutoff.value = 0.6;
    RimCutoff.min = 0;
    RimCutoff.max = 0;
    RimCutoff.isBoolean = false;
    RimCutoff.matrixMode = 0;
    RimCutoff.animationType = AnimatedInputBlockTypes.None;
    RimCutoff.isConstant = false;

    // ScaleBlock
    var Scale = new ScaleBlock("Scale");
    Scale.visibleInInspector = false;
    Scale.visibleOnFrame = false;
    Scale.target = 4;

    // InputBlock
    var RimLightColor = new InputBlock("Rim Light Color");
    RimLightColor.visibleInInspector = false;
    RimLightColor.visibleOnFrame = false;
    RimLightColor.target = 1;
    RimLightColor.value = new Color3(1, 1, 1);
    RimLightColor.isConstant = false;

    // AddBlock
    var AddRimSpecDiffuseAmbient = new AddBlock(
      "Add Rim + Spec + Diffuse + Ambient"
    );
    AddRimSpecDiffuseAmbient.visibleInInspector = false;
    AddRimSpecDiffuseAmbient.visibleOnFrame = false;
    AddRimSpecDiffuseAmbient.target = 4;

    // AddBlock
    var AddSpecularDiffuseAmbient = new AddBlock(
      "Add Specular + Diffuse + Ambient"
    );
    AddSpecularDiffuseAmbient.visibleInInspector = false;
    AddSpecularDiffuseAmbient.visibleOnFrame = false;
    AddSpecularDiffuseAmbient.target = 4;

    // AddBlock
    var AddAmbienttoDiffuseLight = new AddBlock("Add Ambient to Diffuse Light");
    AddAmbienttoDiffuseLight.visibleInInspector = false;
    AddAmbienttoDiffuseLight.visibleOnFrame = false;
    AddAmbienttoDiffuseLight.target = 4;

    // InputBlock
    var AmbientLightColor = new InputBlock("Ambient Light Color");
    AmbientLightColor.visibleInInspector = false;
    AmbientLightColor.visibleOnFrame = false;
    AmbientLightColor.target = 1;
    AmbientLightColor.value = new Color3(
      0.1803921568627451,
      0.1803921568627451,
      0.1803921568627451
    );
    AmbientLightColor.isConstant = false;

    // ScaleBlock
    var DiffuseLightCalculation = new ScaleBlock("Diffuse Light Calculation");
    DiffuseLightCalculation.visibleInInspector = false;
    DiffuseLightCalculation.visibleOnFrame = false;
    DiffuseLightCalculation.target = 4;

    // InputBlock
    var DiffuseLightColor = new InputBlock("Diffuse Light Color");
    DiffuseLightColor.visibleInInspector = false;
    DiffuseLightColor.visibleOnFrame = false;
    DiffuseLightColor.target = 1;
    DiffuseLightColor.value = new Color3(
      0.6901960784313725,
      0.6901960784313725,
      0.6901960784313725
    );
    DiffuseLightColor.isConstant = false;

    // StepBlock
    var QuantizedDiffuseLightIntensity = new StepBlock(
      "Quantized Diffuse Light Intensity"
    );
    QuantizedDiffuseLightIntensity.visibleInInspector = false;
    QuantizedDiffuseLightIntensity.visibleOnFrame = false;
    QuantizedDiffuseLightIntensity.target = 4;

    // InputBlock
    var DiffuseCutoff = new InputBlock("Diffuse Cutoff");
    DiffuseCutoff.visibleInInspector = false;
    DiffuseCutoff.visibleOnFrame = false;
    DiffuseCutoff.target = 1;
    DiffuseCutoff.value = 0;
    DiffuseCutoff.min = 0;
    DiffuseCutoff.max = 0;
    DiffuseCutoff.isBoolean = false;
    DiffuseCutoff.matrixMode = 0;
    DiffuseCutoff.animationType = AnimatedInputBlockTypes.None;
    DiffuseCutoff.isConstant = false;

    // MultiplyBlock
    var SpecularFactor = new MultiplyBlock("Specular Factor");
    SpecularFactor.visibleInInspector = false;
    SpecularFactor.visibleOnFrame = false;
    SpecularFactor.target = 4;

    // DotBlock
    var NDotH = new DotBlock("N Dot H");
    NDotH.visibleInInspector = false;
    NDotH.visibleOnFrame = false;
    NDotH.target = 4;

    // NormalizeBlock
    var HNormalized = new NormalizeBlock("H (Normalized)");
    HNormalized.visibleInInspector = false;
    HNormalized.visibleOnFrame = false;
    HNormalized.target = 4;

    // PowBlock
    var SpecularIntensity = new PowBlock("Specular Intensity");
    SpecularIntensity.visibleInInspector = false;
    SpecularIntensity.visibleOnFrame = false;
    SpecularIntensity.target = 4;

    // MultiplyBlock
    var Glossiness = new MultiplyBlock("Glossiness ^2");
    Glossiness.visibleInInspector = false;
    Glossiness.visibleOnFrame = false;
    Glossiness.target = 4;

    // InputBlock
    var Glossiness1 = new InputBlock("Glossiness");
    Glossiness1.visibleInInspector = false;
    Glossiness1.visibleOnFrame = false;
    Glossiness1.target = 1;
    Glossiness1.value = 5;
    Glossiness1.min = 0;
    Glossiness1.max = 0;
    Glossiness1.isBoolean = false;
    Glossiness1.matrixMode = 0;
    Glossiness1.animationType = AnimatedInputBlockTypes.None;
    Glossiness1.isConstant = false;

    // StepBlock
    var QuantizedSpecularIntensity = new StepBlock(
      "Quantized Specular Intensity"
    );
    QuantizedSpecularIntensity.visibleInInspector = false;
    QuantizedSpecularIntensity.visibleOnFrame = false;
    QuantizedSpecularIntensity.target = 4;

    // InputBlock
    var SpecularCutoff = new InputBlock("Specular Cutoff");
    SpecularCutoff.visibleInInspector = false;
    SpecularCutoff.visibleOnFrame = false;
    SpecularCutoff.target = 1;
    SpecularCutoff.value = 0.5;
    SpecularCutoff.min = 0;
    SpecularCutoff.max = 0;
    SpecularCutoff.isBoolean = false;
    SpecularCutoff.matrixMode = 0;
    SpecularCutoff.animationType = AnimatedInputBlockTypes.None;
    SpecularCutoff.isConstant = false;

    // ScaleBlock
    var CalculateSpecularLight = new ScaleBlock("Calculate Specular Light");
    CalculateSpecularLight.visibleInInspector = false;
    CalculateSpecularLight.visibleOnFrame = false;
    CalculateSpecularLight.target = 4;

    // InputBlock
    var Color = new InputBlock("Color3");
    Color.visibleInInspector = false;
    Color.visibleOnFrame = false;
    Color.target = 1;
    Color.value = new Color3(1, 1, 1);
    Color.isConstant = false;

    // MultiplyBlock
    var MultiplyLightingbyColor = new MultiplyBlock(
      "Multiply Lighting by Color"
    );
    MultiplyLightingbyColor.visibleInInspector = false;
    MultiplyLightingbyColor.visibleOnFrame = false;
    MultiplyLightingbyColor.target = 4;

    // TextureBlock (TEXTURE)
    var texture = new TextureBlock("Texture");

    // InputBlock (TEXTURE)
    var uv = new InputBlock("uv");

    // ImageSourceBlock (TEXTURE)
    var SurfaceTexture = new ImageSourceBlock("Surface Texture");

    // InputBlock (COLOR)
    var SurfaceColor = new InputBlock("Surface Color");

    texture.visibleInInspector = false;
    texture.visibleOnFrame = false;
    texture.target = 3;
    texture.convertToGammaSpace = false;
    texture.convertToLinearSpace = false;
    texture.disableLevelMultiplication = false;
    texture.texture = inputTexture;
    texture.texture.wrapU = 1;
    texture.texture.wrapV = 1;
    texture.texture.uAng = 0;
    texture.texture.vAng = 0;
    texture.texture.wAng = 0;
    texture.texture.uOffset = 0;
    texture.texture.vOffset = 0;
    texture.texture.uScale = 1;
    texture.texture.vScale = 1;
    texture.texture.coordinatesMode = 7;

    // InputBlock (TEXTURE)
    uv.visibleInInspector = false;
    uv.visibleOnFrame = false;
    uv.target = 1;
    uv.setAsAttribute("uv");

    // ImageSourceBlock (TEXTURE)
    SurfaceTexture.visibleInInspector = false;
    SurfaceTexture.visibleOnFrame = false;
    SurfaceTexture.target = 3;
    SurfaceTexture.texture = inputTexture;
    SurfaceTexture.texture.wrapU = 1;
    SurfaceTexture.texture.wrapV = 1;
    SurfaceTexture.texture.uAng = 0;
    SurfaceTexture.texture.vAng = 0;
    SurfaceTexture.texture.wAng = 0;
    SurfaceTexture.texture.uOffset = 0;
    SurfaceTexture.texture.vOffset = 0;
    SurfaceTexture.texture.uScale = 1;
    SurfaceTexture.texture.vScale = 1;
    SurfaceTexture.texture.coordinatesMode = 7;

    // FragmentOutputBlock
    var fragmentOutput = new FragmentOutputBlock("fragmentOutput");
    fragmentOutput.visibleInInspector = false;
    fragmentOutput.visibleOnFrame = false;
    fragmentOutput.target = 2;
    fragmentOutput.convertToGammaSpace = undefined;
    fragmentOutput.convertToLinearSpace = undefined;
    fragmentOutput.useLogarithmicDepth = false;

    // TransformBlock
    var worldPosviewProjectionTransform = new TransformBlock(
      "worldPos * viewProjectionTransform"
    );
    worldPosviewProjectionTransform.visibleInInspector = false;
    worldPosviewProjectionTransform.visibleOnFrame = false;
    worldPosviewProjectionTransform.target = 1;
    worldPosviewProjectionTransform.complementZ = 0;
    worldPosviewProjectionTransform.complementW = 1;

    // InputBlock
    var viewProjection = new InputBlock("viewProjection");
    viewProjection.visibleInInspector = false;
    viewProjection.visibleOnFrame = false;
    viewProjection.target = 1;
    viewProjection.setAsSystemValue(NodeMaterialSystemValues.ViewProjection);

    // VertexOutputBlock
    var vertexOutput = new VertexOutputBlock("vertexOutput");
    vertexOutput.visibleInInspector = false;
    vertexOutput.visibleOnFrame = false;
    vertexOutput.target = 1;

    // Connections
    position.output.connectTo(worldPos.vector);
    world.output.connectTo(worldPos.transform);
    worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
    viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
    worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
    AmbientLightColor.output.connectTo(AddAmbienttoDiffuseLight.left);
    DiffuseLightColor.output.connectTo(DiffuseLightCalculation.input);
    normal.output.connectTo(Worldnormal.vector);
    world.output.connectTo(Worldnormal.transform);
    Worldnormal.output.connectTo(N.xyzw);
    N.xyzOut.connectTo(NNormalized.input);
    NNormalized.output.connectTo(NDotLDiffuseLightIntensity.left);
    worldPos.output.connectTo(Lightinformation.worldPosition);
    Lightinformation.direction.connectTo(LNormalized.input);
    LNormalized.output.connectTo(NDotLDiffuseLightIntensity.right);
    NDotLDiffuseLightIntensity.output.connectTo(
      QuantizedDiffuseLightIntensity.value
    );
    DiffuseCutoff.output.connectTo(QuantizedDiffuseLightIntensity.edge);
    QuantizedDiffuseLightIntensity.output.connectTo(
      DiffuseLightCalculation.factor
    );
    DiffuseLightCalculation.output.connectTo(AddAmbienttoDiffuseLight.right);
    AddAmbienttoDiffuseLight.output.connectTo(AddSpecularDiffuseAmbient.left);
    Color.output.connectTo(CalculateSpecularLight.input);
    NNormalized.output.connectTo(NDotH.left);
    worldPos.output.connectTo(Viewdirection.worldPosition);
    cameraPosition.output.connectTo(Viewdirection.cameraPosition);
    Viewdirection.output.connectTo(VNormalized.input);
    VNormalized.output.connectTo(H.left);
    LNormalized.output.connectTo(H.right);
    H.output.connectTo(HNormalized.input);
    HNormalized.output.connectTo(NDotH.right);
    NDotH.output.connectTo(SpecularFactor.left);
    QuantizedDiffuseLightIntensity.output.connectTo(SpecularFactor.right);
    SpecularFactor.output.connectTo(SpecularIntensity.value);
    Glossiness1.output.connectTo(Glossiness.left);
    Glossiness1.output.connectTo(Glossiness.right);
    Glossiness.output.connectTo(SpecularIntensity.power);
    SpecularIntensity.output.connectTo(QuantizedSpecularIntensity.value);
    SpecularCutoff.output.connectTo(QuantizedSpecularIntensity.edge);
    QuantizedSpecularIntensity.output.connectTo(CalculateSpecularLight.factor);
    CalculateSpecularLight.output.connectTo(AddSpecularDiffuseAmbient.right);
    AddSpecularDiffuseAmbient.output.connectTo(AddRimSpecDiffuseAmbient.left);
    RimLightColor.output.connectTo(Scale.input);
    NNormalized.output.connectTo(NDotV.left);
    VNormalized.output.connectTo(NDotV.right);
    NDotV.output.connectTo(NDotV1.input);
    NDotV1.output.connectTo(RimINtensity.left);
    NDotLDiffuseLightIntensity.output.connectTo(RimFactor.value);
    RimIntensity.output.connectTo(RimFactor.power);
    RimFactor.output.connectTo(RimINtensity.right);
    RimINtensity.output.connectTo(QuantizedRimLightIntensity.value);
    RimCutoff.output.connectTo(QuantizedRimLightIntensity.edge);
    QuantizedRimLightIntensity.output.connectTo(Scale.factor);
    Scale.output.connectTo(AddRimSpecDiffuseAmbient.right);
    AddRimSpecDiffuseAmbient.output.connectTo(MultiplyLightingbyColor.left);

    uv.output.connectTo(texture.uv);
    SurfaceTexture.source.connectTo(texture.source);
    texture.rgb.connectTo(MultiplyLightingbyColor.right);

    MultiplyLightingbyColor.output.connectTo(fragmentOutput.rgb);

    // Output nodes
    nodeMaterial.addOutputNode(vertexOutput);
    nodeMaterial.addOutputNode(fragmentOutput);
    nodeMaterial.build();

    return nodeMaterial;
  }
}
