// export default fragment;
const fragment = /* glsl */ `
  #define layers 4 // Increased layers for depth and motion complexity

uniform float iTime;
uniform float iAlpha;
uniform float iLight;
uniform vec2 iResolution;
uniform float scale;
uniform float speed;

varying vec2 vUv;
varying vec3 vNormal;

const float PI = 3.14159265359;

// Hash function for generating pseudo-random vectors
vec3 hash(vec3 p) {
    p = vec3(
        dot(p, vec3(127.1, 311.7, 74.7)),
        dot(p, vec3(269.5, 183.3, 246.1)),
        dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 3D Noise function
float noise(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
        mix(
            mix(dot(hash(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)),
                dot(hash(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
            mix(dot(hash(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)),
                dot(hash(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x), u.y),
        mix(
            mix(dot(hash(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)),
                dot(hash(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
            mix(dot(hash(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)),
                dot(hash(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x), u.y),
        u.z);
}

void main() {
    // Normalized device coordinates from -1 to 1
    vec2 uv = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

    // Time variable for animation
    float t = iTime * speed;

    // Scaling the UV coordinates
    uv *= scale;

    // Base noise for cloud structure
    float h = noise(vec3(uv * 2.0, t));

    // UV distortion loop for multiple layers
    for (int n = 1; n < layers; n++) {
        float layer = float(n);
        uv += vec2(
            0.4 / layer * sin(layer * uv.y + t * 0.5 + h * layer),
            0.3 / layer * cos(layer * uv.x + t * 0.3 + h * layer)
        );
    }

    // Additional complex UV distortions
    uv += vec2(
        0.6 * sin(uv.x * 1.5 + t * 0.5 + h * 1.0),
        0.5 * cos(uv.y * 1.2 + t * 0.4 + h * 0.8)
    );

    // Enhanced noise for finer details
    float detail = noise(vec3(uv * 4.0, t * 0.5));

    // Combine base and detail noise
    float combinedNoise = mix(h, detail, 0.7);

    // Smooth intensity transitions
    float intensity = smoothstep(0.2, 0.8, combinedNoise);

    // Define a brighter gold color palette
    vec3 goldBase = vec3(1.0, 0.9, 0.5); // Bright gold
    vec3 goldHighlight = vec3(1.2, 1.0, 0.6); // Highlighted gold

    // Blend colors based on intensity
    vec3 col = mix(goldBase, goldHighlight, intensity);

    // Add dynamic highlights using sine modulation
    col += 0.3 * vec3(1.0, 0.8, 0.4) * sin(t * 2.0 + uv.x * PI);

    // Increase brightness and vibrancy
    col *= 1.5; // Amplify the brightness

    // Apply lighting factor
    col *= iLight;

    // Ensure areas outside the cloud remain dark
    col = mix(vec3(0.0), col, intensity);

    // Final color with alpha
    gl_FragColor = vec4(col, iAlpha);
}
  

`

export default fragment

// const fragment = /* glsl */ `
//   #define layers 3 // Number of layers for distortion

//   uniform float iTime;
//   uniform float iAlpha;
//   uniform float iLight;
//   uniform vec2 iResolution;
//   uniform float scale;
//   uniform float speed;

//   varying vec2 vUv;
//   varying vec3 vNormal;

//   float PI = 3.141529;

//   // Hash function for noise
//   vec3 hash(vec3 p) {
//     p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
//     p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
//     return p;
//   }

//   // Noise function
//   float noise(in vec3 p) {
//     vec3 i = floor(p);
//     vec3 f = fract(p);
//     vec3 u = f * f * (3.0 - 2.0 * f);
//     return mix(
//       mix(
//         mix(dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
//             dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
//         mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
//             dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x),
//         u.y),
//       mix(
//         mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
//             dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
//         mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
//             dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x),
//         u.y),
//       u.z);
//   }

//   void main() {
//     // Normalized device coordinates from -1 to 1
//     vec2 uv = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

//     // Time value for animation
//     float t = iTime * speed;

//     uv *= scale;

//     // Add noise for subtle distortion
//     float h = noise(vec3(uv * 2.0, t));

//     // UV distortion loop for dynamic layers
//     for (int n = 1; n < layers; n++) {
//       float i = float(n);
//       uv -= vec2(
//         0.7 / i * sin(i * uv.y + i + t * 5.0 + h * i) + 0.8,
//         0.4 / i * sin(uv.x + 4.0 - i + h + t * 5.0 + 0.3 * i) + 1.6
//       );
//     }

//     uv -= vec2(
//       1.2 * sin(uv.x + t + h) + 1.8,
//       0.4 * sin(uv.y + t + 0.3 * h) + 1.6
//     );

//     // Create a dynamic, shiny black-and-white effect
//     vec3 col = vec3(
//       0.3 + 0.2 * sin(uv.x * 10.0 + t * 0.5), // Subtle horizontal shine
//       0.3 + 0.2 * sin(uv.y * 10.0 + t * 0.6), // Subtle vertical shine
//       0.3 + 0.2 * sin(uv.x * 5.0 + uv.y * 5.0 + t * 0.8) // Dynamic center highlight
//     );

//     // Amplify brightness with light intensity
//     col *= iLight;

//     // Mix with black background for contrast
//     col = mix(vec3(0.0), col, 0.8);

//     // Output to screen with alpha transparency
//     gl_FragColor = vec4(col, iAlpha);
//   }
// `;

// export default fragment;

// black background with white grid lines
// const fragment = /* glsl */ `
//   #define layers 2

// uniform float iTime;
// uniform float iAlpha;
// uniform float iLight;
// uniform vec2 iResolution;
// uniform float scale;
// uniform float speed;

// float noise(vec2 p) {
//     vec2 i = floor(p);
//     vec2 f = fract(p);
//     f = f * f * (3.0 - 2.0 * f);
//     float n = dot(i, vec2(1.0, 57.0));
//     return mix(mix(fract(sin(n+0.0)*43758.5453), fract(sin(n+1.0)*43758.5453), f.x),
//                mix(fract(sin(n+57.0)*43758.5453), fract(sin(n+58.0)*43758.5453), f.x), f.y);
// }

// void main() {
//     vec2 uv = (gl_FragCoord.xy / iResolution) * scale;
//     float t = iTime * speed;

//     // Create a base black background
//     vec3 baseColor = vec3(0.0);

//     // Add subtle horizontal and vertical lines that fade in and out
//     float lineStrengthX = smoothstep(0.48, 0.5, fract(uv.x * 10.0 + t * 0.2)) * smoothstep(0.52, 0.5, fract(uv.x * 10.0 + t * 0.2));
//     float lineStrengthY = smoothstep(0.48, 0.5, fract(uv.y * 10.0 + t * 0.2)) * smoothstep(0.52, 0.5, fract(uv.y * 10.0 + t * 0.2));

//     float line = max(lineStrengthX, lineStrengthY);

//     // Add gentle noise to make the lines shimmer
//     float n = noise(uv * 5.0 + t * 0.1);

//     // The final color transitions between black and a light grayish white depending on line presence
//     vec3 lineColor = mix(baseColor, vec3(0.9), line * (0.7 + 0.3 * n));

//     // Combine with light intensity and alpha
//     vec3 col = lineColor * iLight;
//     gl_FragColor = vec4(col, iAlpha);
// }
// `;

// export default fragment;

// moving grid

// const fragment = /* glsl */ `
//   uniform float iTime;
//   uniform float iAlpha;
//   uniform float iLight;
//   uniform vec2 iResolution;
//   uniform float scale;
//   uniform float speed;

//   float noise(vec2 p) {
//       vec2 i = floor(p), f = fract(p);
//       f = f*f*(3.0-2.0*f);
//       float n = dot(i, vec2(1.0,57.0));
//       return mix(mix(fract(sin(n)*43758.5453), fract(sin(n+1.0)*43758.5453), f.x),
//                 mix(fract(sin(n+57.0)*43758.5453), fract(sin(n+58.0)*43758.5453), f.x), f.y);
//   }

//   void main() {
//       vec2 uv = (gl_FragCoord.xy / iResolution) * scale;
//       float t = iTime * speed;

//       // Base black
//       vec3 base = vec3(0.0);

//       // Horizontal scanlines: alternate dark and slightly lighter lines
//       float scan = smoothstep(0.0,0.1,abs(fract(uv.y * 40.0)-0.5)) * 0.2;
//       // This creates subtle lines. Increase or decrease frequency or step width to adjust.

//       // Moving bars: vertical bright bars sweeping across the screen
//       // Use sine for position and noise for variation
//       float barPos = uv.x * 5.0 - t * 0.5;
//       float bar = smoothstep(0.49,0.5,fract(barPos)) * smoothstep(0.51,0.5,fract(barPos));
//       // Add noise-based flicker
//       float flicker = noise(vec2(uv.x * 2.0 + t, uv.y * 2.0)) * 0.5;
//       bar *= 0.5 + flicker; // Let bar brightness vary

//       // Combine scanlines and bars
//       float brightness = scan + bar;
//       vec3 col = mix(base, vec3(1.0), brightness);

//       // Slight tint towards cool white/gray by limiting maximum brightness
//       col = col * (0.8 + 0.2 * sin(t*0.3));

//       // Apply iLight and alpha
//       col *= iLight;
//       gl_FragColor = vec4(col, iAlpha);
//   }

// `;



