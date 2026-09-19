import type { ShaderBackgroundEffect } from "./types";

const common = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_seed;
uniform float u_intensity;
uniform vec3 u_base;
uniform vec3 u_accent;
uniform vec3 u_secondary;
const float TAU = 6.2831853;
float hash(vec2 p) {
  p = fract(p * vec2(0.1031, 0.11369));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}
float noise(vec2 p) {
  vec2 a = floor(p), b = fract(p);
  b = b * b * (3.0 - 2.0 * b);
  return mix(mix(hash(a), hash(a+vec2(1.,0.)), b.x),
             mix(hash(a+vec2(0.,1.)), hash(a+1.), b.x), b.y);
}
float field(vec2 p) {
  return noise(p)*0.57 + noise(p*2.03+7.1)*0.28 + noise(p*4.11+19.2)*0.15;
}
vec2 coordinates() {
  vec2 p = (gl_FragCoord.xy / u_resolution - 0.5);
  p.x *= u_resolution.x / u_resolution.y;
  return p + u_pointer * 0.075;
}
void outputColor(vec3 color, float strength) {
  gl_FragColor = vec4(mix(u_base, color, clamp(strength*u_intensity, 0., 1.)), 1.);
}
`;

// Each program compiles only its own material, sharing no third-party shader code.
const effects: Record<ShaderBackgroundEffect, string> = {
  "liquid-mesh": `
void main() {
  vec2 p=coordinates(); float t=u_time*0.22+u_seed;
  p += vec2(sin(p.y*3.2+t), cos(p.x*2.8-t))*0.16;
  vec2 a=vec2(sin(t*.7)*.55, cos(t*.5)*.23);
  vec2 b=vec2(cos(t*.6)*.65, sin(t*.8)*.3);
  float pool=exp(-dot(p-a,p-a)*2.8);
  float other=exp(-dot(p-b,p-b)*3.8);
  float fold=.5+.5*sin(p.x*2.7+p.y*3.1+t);
  vec3 color=mix(u_accent,u_secondary,clamp(other*.8+fold*.3,0.,1.));
  outputColor(color,.18+pool*.7+other*.35);
}`,
  "silk-flow": `
void main() {
  vec2 p=coordinates(); float t=u_time*.26+u_seed;
  float bend=sin(p.x*1.7+t)*.55 + sin(p.y*2.4-t*.6)*.28;
  float fabric=p.y*8.0+p.x*3.0+bend*4.0;
  float folds=pow(.5+.5*sin(fabric),3.0);
  float seam=pow(.5+.5*sin(fabric+0.8),14.0);
  float thread=.94+.06*sin(fabric*15.0);
  vec3 color=mix(u_accent,u_secondary,.5+.5*sin(fabric*.3+t*.4));
  outputColor(color,(folds*.7+seam*.35)*thread+.035);
}`,
  "caustic-light": `
void main() {
  vec2 p=coordinates()*4.; float t=u_time*.25+u_seed;
  p += vec2(sin(p.y*1.2+t),cos(p.x*.9-t))*.5;
  float a=sin(p.x*2.+sin(p.y+t))+cos(p.y*2.3-t*.7);
  float b=sin(p.y*2.8+cos(p.x-t))+cos(p.x*1.9+t*.6);
  float ridge=pow(max(0.,1.-abs(a*b)*1.6),7.);
  float water=.5+.5*sin(p.x*.6+p.y*.8+t*.3);
  vec3 color=mix(u_accent,u_secondary,water);
  outputColor(color,.12+ridge*.85);
}`,
  "contour-field": `
void main() {
  vec2 p=coordinates()*2.2; float t=u_time*.075+u_seed;
  vec2 warp=vec2(field(p+vec2(t,0.)),field(p+vec2(7.3,-t)));
  float terrain=field(p+warp*1.7+vec2(t*.25,-t*.3));
  float bands=terrain*13.;
  float edge=abs(fract(bands)-.5);
  float aa=clamp(38./u_resolution.y,.025,.14);
  float line=1.-smoothstep(.025,.025+aa,edge);
  vec3 color=mix(u_accent,u_secondary,terrain);
  outputColor(color,.035+line*.85);
}`,
  "orbital-glow": `
void main() {
  vec2 p=coordinates(); float t=u_time*.16+u_seed;
  p-=vec2(.18*sin(t*.3),.08*cos(t*.4));
  float light=0., hue=0.;
  for(int i=0;i<4;i++) {
    float f=float(i), angle=.35+f*.6;
    vec2 q=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
    q.y*=1.55+f*.17;
    float radius=.25+f*.115;
    float d=abs(length(q)-radius);
    float arc=.3+.7*pow(.5+.5*cos(atan(q.y,q.x)-t-f*1.7),3.);
    float ring=(exp(-d*95.)*.65+exp(-d*15.)*.17)*arc;
    light+=ring; hue+=ring*f/3.;
  }
  float core=exp(-dot(p,p)*18.)*.18;
  vec3 color=mix(u_accent,u_secondary,clamp(hue/max(light,.001),0.,1.));
  outputColor(color,light+core);
}`,
};

export const backgroundVertex = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.,1.);}`;
export const backgroundFragment = (effect: ShaderBackgroundEffect) =>
  common + effects[effect];
