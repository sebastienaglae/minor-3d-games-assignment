#if defined(WEBGL2) || defines(WEBGPU)
precision highp sampler2DArray;
#endif
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec4 tangent;
attribute vec2 uv;
attribute vec4 matricesIndices;
attribute vec4 matricesWeights;
attribute vec4 world0;
attribute vec4 world1;
attribute vec4 world2;
attribute vec4 world3;


uniform mat4 u_World;
#ifdef UVTRANSFORM0
uniform mat4 textureTransform;
#endif
uniform vec3 lightData;
uniform vec4 lightColor;
uniform mat4 u_ViewProjection;
uniform vec3 u_cameraPosition;
uniform vec3 u_wh;
uniform float u_Float;
uniform float u_;
uniform float u_diffuseCut;
uniform float u_1;
uniform float u_2;
uniform float u_3;
uniform float u_4;
uniform float u_softTerminator;
uniform float u_5;
uniform float u_6;
uniform float u_7;
uniform float u_8;
uniform float u_Float1;
uniform float u_shadowItensity;
uniform float u_subsurIntensity;
uniform float u_Float2;
uniform vec3 u_refColor;
uniform float u_9;
uniform float u_rimIntensity;
uniform float u_10;
uniform float u_glossiness;
uniform float u_specularIntensity;
uniform vec3 u_AmbientLight;
uniform vec3 u_bl;
uniform float u_11;


uniform sampler2D TextureSampler;


#ifdef UVTRANSFORM0
varying vec2 transformedUV;
#endif
#ifdef VMAINUV
varying vec2 vMainuv;
#endif
varying vec4 v_output1;
varying vec4 v_output2;
varying vec4 v_output5;
varying vec3 v_direction;


#include<helperFunctions>

#include<morphTargetsVertexGlobalDeclaration>

#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]

#if NUM_BONE_INFLUENCERS>0


#if NUM_BONE_INFLUENCERS>4


#endif
#ifndef BAKED_VERTEX_ANIMATION_TEXTURE
#ifdef BONETEXTURE
uniform sampler2D boneSampler;
uniform float boneTextureWidth;
#else
uniform mat4 mBones[BonesPerMesh];
#ifdef BONES_VELOCITY_ENABLED
uniform mat4 mPreviousBones[BonesPerMesh];
#endif
#endif
#ifdef BONETEXTURE
#define inline
mat4 readMatrixFromRawSampler(sampler2D smp,float index)
{
float offset=index *4.0;
float dx=1.0/boneTextureWidth;
vec4 m0=texture2D(smp,vec2(dx*(offset+0.5),0.));
vec4 m1=texture2D(smp,vec2(dx*(offset+1.5),0.));
vec4 m2=texture2D(smp,vec2(dx*(offset+2.5),0.));
vec4 m3=texture2D(smp,vec2(dx*(offset+3.5),0.));
return mat4(m0,m1,m2,m3);
}
#endif
#endif
#endif

#include<lightVxUboDeclaration>[0..maxSimultaneousLights]



void main(void) {
mat3 u_World_NUS = mat3(u_World);
#ifdef NONUNIFORMSCALING
u_World_NUS = transposeMat3(inverseMat3(u_World_NUS));
#endif
vec4 output2 = vec4(u_World_NUS * normal, 0.0);
#ifdef UVTRANSFORM0
transformedUV = vec2(textureTransform * vec4(uv.xy, 1.0, 0.0));
#elif defined(VMAINUV)
vMainuv = uv.xy;
#endif
vec3 positionOutput = position;
#ifdef NORMAL
vec3 normalOutput = normal;
#else
vec3 normalOutput = vec3(0., 0., 0.);
#endif
#ifdef TANGENT
vec4 tangentOutput = tangent;
#else
vec4 tangentOutput = vec4(0., 0., 0., 0.);
#endif
#ifdef UV1
vec2 uvOutput = uv;
#else
vec2 uvOutput = vec2(0., 0.);
#endif
###___ANCHOR0___####ifdef INSTANCES
mat4 output4 = mat4(world0, world1, world2, world3);
#ifdef THIN_INSTANCES
output4 = u_World * output4;
#endif
float instanceID = float(gl_InstanceID);
#else
mat4 output4 = u_World;
float instanceID = 0.0;
#endif
#ifndef BAKED_VERTEX_ANIMATION_TEXTURE
#if NUM_BONE_INFLUENCERS>0
mat4 influence;
#ifdef BONETEXTURE
influence=readMatrixFromRawSampler(boneSampler,matricesIndices[0])*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[1])*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[2])*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
influence+=readMatrixFromRawSampler(boneSampler,matricesIndices[3])*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[0])*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[1])*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[2])*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
influence+=readMatrixFromRawSampler(boneSampler,matricesIndicesExtra[3])*matricesWeightsExtra[3];
#endif
#else
influence=mBones[int(matricesIndices[0])]*matricesWeights[0];
#if NUM_BONE_INFLUENCERS>1
influence+=mBones[int(matricesIndices[1])]*matricesWeights[1];
#endif
#if NUM_BONE_INFLUENCERS>2
influence+=mBones[int(matricesIndices[2])]*matricesWeights[2];
#endif
#if NUM_BONE_INFLUENCERS>3
influence+=mBones[int(matricesIndices[3])]*matricesWeights[3];
#endif
#if NUM_BONE_INFLUENCERS>4
influence+=mBones[int(matricesIndicesExtra[0])]*matricesWeightsExtra[0];
#endif
#if NUM_BONE_INFLUENCERS>5
influence+=mBones[int(matricesIndicesExtra[1])]*matricesWeightsExtra[1];
#endif
#if NUM_BONE_INFLUENCERS>6
influence+=mBones[int(matricesIndicesExtra[2])]*matricesWeightsExtra[2];
#endif
#if NUM_BONE_INFLUENCERS>7
influence+=mBones[int(matricesIndicesExtra[3])]*matricesWeightsExtra[3];
#endif
#endif

#endif
#endif

#if NUM_BONE_INFLUENCERS>0
mat4 output3 = output4 * influence;
#else
mat4 output3 = output4;
#endif
vec4 output1 = output3 * vec4(positionOutput, 1.0);
v_output1 = output1;
vec4 worldPos = output1;
#include<shadowsVertex>[0..maxSimultaneousLights]
#ifdef LIGHTPOINTTYPE0
vec3 direction = normalize(output1.xyz - lightData);
#else
vec3 direction = lightData;
#endif
vec3 color1 = lightColor.rgb;
float intensity = lightColor.a;
mat3 u_World_NUS1 = mat3(u_World);
#ifdef NONUNIFORMSCALING
u_World_NUS1 = transposeMat3(inverseMat3(u_World_NUS1));
#endif
vec4 output5 = vec4(u_World_NUS1 * normal, 0.0);
vec4 output0 = u_ViewProjection * output1;
gl_Position = output0;
v_output2 = output2;
v_output5 = output5;
v_direction = direction;

}