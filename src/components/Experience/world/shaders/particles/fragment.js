const fragment = /* glsl */ `
uniform float uStrength;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = uStrength / distanceToCenter - uStrength * 2.0;
  // Define gold color with slight variation for depth
  vec3 gold = vec3(1.0, 0.843, 0.0); // RGB for gold
  // Apply strength to alpha for fading effect
  float alpha = strength * 2.0; // Adjust multiplier as needed

  // Add a subtle glow based on distance
  float glow = smoothstep(0.45, 0.5, distanceToCenter) * 0.5;
  // gl_FragColor = vec4(0.2, 0.2, 1.0, strength);
  gl_FragColor = vec4(gold, alpha + glow);
}
`
export default fragment
