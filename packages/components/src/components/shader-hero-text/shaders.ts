export const planeVertex = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const textFragment = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_mask;
uniform vec2 u_resolution;
uniform vec3 u_base, u_accent, u_sheen;
uniform float u_progress, u_intensity, u_seed;
uniform int u_effect;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)) + u_seed) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float mask(vec2 uv) {
  if (uv.x<0.0 || uv.y<0.0 || uv.x>1.0 || uv.y>1.0) return 0.0;
  return texture2D(u_mask,uv).a;
}
void main() {
  vec2 uv = v_uv;
  float p = u_progress;
  float envelope = sin(p * 3.14159265);
  float strength = u_intensity * envelope;
  vec3 color = u_base;
  float alpha;
  if (u_effect == 0) {
    vec2 q = (uv-vec2(0.5)) * vec2(u_resolution.x/u_resolution.y,1.0);
    float r = length(q);
    float wave = sin(r*18.0-p*15.0) * exp(-r*1.8);
    uv += normalize(q+vec2(0.0001)) * wave * strength * 0.026;
    color = mix(u_base,u_accent,abs(wave)*strength*0.7);
  } else if (u_effect == 1) {
    float band = exp(-pow((uv.x-p)*5.0,2.0));
    float shift = band*strength*0.035;
    uv.y += sin(uv.x*12.0-p*8.0)*shift;
    float left = mask(uv-vec2(shift,0));
    float center = mask(uv);
    float right = mask(uv+vec2(shift,0));
    alpha = max(center,max(left,right));
    color = (u_accent*left + u_base*center + u_sheen*right)/max(left+center+right,0.001);
    gl_FragColor = vec4(color*alpha,alpha); return;
  } else if (u_effect == 3) {
    uv.y += sin(uv.x*10.0-p*8.0)*strength*0.09;
    uv.x += cos(uv.y*8.0+p*6.0)*strength*0.012;
  }
  alpha = mask(uv);
  if (u_effect == 2) {
    float n = noise(uv*vec2(95.0,45.0))*0.65 + uv.x*0.35;
    float edge = p*1.2-0.1-n;
    float reveal = smoothstep(-0.025,0.025,edge);
    alpha *= reveal;
    color = mix(u_base,u_accent,(1.0-smoothstep(0.02,0.13,edge))*u_intensity);
  } else if (u_effect == 4) {
    vec2 pixel = 1.0/u_resolution;
    vec2 gradient = vec2(mask(uv+vec2(pixel.x*2.0,0))-mask(uv-vec2(pixel.x*2.0,0)),
      mask(uv+vec2(0,pixel.y*2.0))-mask(uv-vec2(0,pixel.y*2.0)));
    float warped = uv.x*6.0+uv.y*2.0+noise(uv*5.0)*1.8 + gradient.x*0.7;
    float stripe = sin(warped*6.28318-p*9.0);
    float specular = pow(max(0.0,stripe),10.0);
    vec3 metal = mix(u_base,u_accent,smoothstep(-0.7,0.3,stripe));
    metal = mix(metal,u_sheen,specular);
    color = mix(u_base,metal,envelope*min(1.0,u_intensity*1.6));
  }
  gl_FragColor = vec4(color*alpha,alpha);
}`;

export const particleVertex = `
attribute vec2 a_position;
uniform vec2 u_resolution;
uniform float u_size;
void main() {
  vec2 uv = a_position / u_resolution;
  gl_Position = vec4(uv.x*2.0-1.0,1.0-uv.y*2.0,0.0,1.0);
  gl_PointSize = u_size;
}`;

export const particleFragment = `
precision mediump float;
uniform vec3 u_base;
void main() {
  float alpha = 1.0-smoothstep(0.30,0.5,length(gl_PointCoord-vec2(0.5)));
  gl_FragColor = vec4(u_base*alpha,alpha);
}`;
