const fragment = /* glsl */ `
  precision mediump float;
    
  uniform float iFactor;
  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform vec3 iColorOuter;
  uniform vec3 iColorInner;

  varying vec2 vOffset;
  varying vec2 vUv;

  vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset ){
    float r = texture2D(textureimage, uv + offset).r;
    vec2 gb = texture2D(textureimage, uv).gb;
    return vec3(r, gb);
  }

  void main() {
    vec3 pixel = vec3(0);
      
    float height = texture(iChannel1, vUv).r;

    pixel = rgbShift(iChannel0, vUv, vOffset).rgb;

    // Define gold colors
    vec3 goldOuter = iColorOuter; // e.g., vec3(1.0, 0.843, 0.0)
    vec3 goldInner = iColorInner; // e.g., vec3(0.8, 0.686, 0.0)
      
    float condition_if_1 = step(height, sin(iFactor - 0.04));
    float condition_if_2 = step(height, sin(iFactor - 0.02));
    float condition_if_3 = step(height, sin(iFactor));

    // Burned layers
    pixel = pixel * (1. - condition_if_1) + goldOuter * condition_if_1;
    pixel = pixel * (1. - condition_if_2) + goldInner * condition_if_2;
    // Black layer
    pixel = pixel * (1. - condition_if_3);

    // Directly set alpha to 1.0 for all pixels
    gl_FragColor = vec4(pixel, 1.0);
  }

`

export default fragment
