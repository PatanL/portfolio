const fragment = /* glsl */ `
  varying float qnoise;
  
  uniform float time;
  uniform bool redhell;
  uniform float r_color;
  uniform float g_color;
  uniform float b_color;

  void main() {
    float r, g, b;

    // r = cos(qnoise + (r_color));
    // g = cos(qnoise + g_color);
    // b = cos(qnoise + (b_color));
    r = cos(qnoise + (r_color)) * 1.2; // Boost red channel
    g = cos(qnoise + g_color) * 0.8;    // Slightly reduce green channel
    b = cos(qnoise + (b_color)) * 0.3;  // Significantly reduce blue channel

    // Clamp values to [0,1] to prevent over-saturation
    r = clamp(r, 0.0, 1.0);
    g = clamp(g, 0.0, 1.0);
    b = clamp(b, 0.0, 1.0);

    
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`

export default fragment
