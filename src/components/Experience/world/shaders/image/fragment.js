const fragment = /* glsl */ `
  // uniform sampler2D uTexture;
  // uniform float uAlpha;
  // uniform vec2 uOffset;
  // varying vec2 vUv;

  // vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset){
  //     float r = texture2D(textureimage, uv + offset).r;
  //     vec2 gb = texture2D(textureimage, uv).gb;
  //     return vec3(r, gb);
  // }

  // void main(){
  //     // vec3 color = texture2D(uTexture, vUv).rgb;
  //     vec3 color = rgbShift(uTexture, vUv, uOffset * 5.0);
  //     gl_FragColor = vec4(color, uAlpha);
  // }
  uniform sampler2D uTexture;
  uniform float uAlpha;
  uniform vec2 uOffset;
  varying vec2 vUv;

  vec3 rgbShift(sampler2D textureimage, vec2 uv, vec2 offset){
      float r = texture2D(textureimage, uv + offset).r;
      float g = texture2D(textureimage, uv).g;
      float b = texture2D(textureimage, uv - offset).b;
      return vec3(r, g, b);
  }

  void main(){
      // Apply RGB shift with modified offsets to favor warm colors
      vec3 color = rgbShift(uTexture, vUv, uOffset * 2.0);
      
      // Enhance gold appearance by adjusting color channels
      color = mix(color, vec3(1.0, 0.843, 0.0), 0.3); // Mix with gold (RGB: 255, 215, 0)
      
      gl_FragColor = vec4(color, uAlpha);
  }

`

export default fragment
