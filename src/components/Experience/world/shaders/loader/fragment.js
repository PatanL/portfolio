// const fragment = /* glsl */ `
//   #define layers 2 //int how many layers

//   uniform float iTime;
//   uniform float iAlpha;
//   uniform float iLight;
//   uniform vec2 iResolution;
//   uniform float scale;
//   uniform float speed;

//   varying vec2 vUv;
//   varying vec3 vNormal;

//   float PI = 3.141529;

//   vec3 hash( vec3 p ) {
//     p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5,271.9, 124.6)));
//     p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);

//     return p;
//   }

//   float noise( in vec3 p ) {
//     vec3 i = floor( p );
//     vec3 f = fract( p );
    
//     vec3 u = f * f * (3.0 - 2.0 * f);

//     return mix( mix( mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
//                           dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
//                     mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
//                           dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
//                 mix( mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
//                           dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
//                     mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
//                           dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
//   }

//   uniform float iLight;         // Lighting intensity
// uniform vec3 cameraPosition;  // Camera position in world space
// uniform vec3 lightDirection;  // Light direction vector
// uniform samplerCube envMap;   // Environment map for reflections
// uniform float metalness;      // Metalness factor (0.0 - 1.0)
// uniform float roughness;      // Roughness factor (0.0 - 1.0)

// varying vec3 fragPosition;    // Fragment position in world space
// varying vec3 vNormal;         // Normal vector

// void main() {
//     // Define a constant gold color
//     vec3 goldColor = vec3(1.0, 0.843, 0.0); // RGB for gold (255, 215, 0)

//     // Calculate diffuse lighting
//     float diffuse = max(dot(normalize(vNormal), normalize(lightDirection)), 0.0);

//     // Calculate specular highlights
//     float specular = pow(max(dot(reflect(-normalize(cameraPosition - fragPosition), normalize(vNormal)), normalize(lightDirection)), 0.0), 16.0);
//     vec3 specularColor = vec3(1.0) * specular;

//     // Calculate reflection from environment map
//     vec3 reflectDir = reflect(-normalize(cameraPosition - fragPosition), normalize(vNormal));
//     vec3 envColor = textureCube(envMap, reflectDir).rgb;

//     // Mix gold color with environment reflections based on metalness
//     vec3 finalColor = (goldColor * diffuse) + (specularColor) + (envColor * metalness);

//     // Apply roughness to control shininess
//     finalColor = mix(finalColor, goldColor * (1.0 - roughness) + (goldColor * 0.5) * roughness, 1.0);

//     // Apply lighting intensity
//     finalColor *= iLight;

//     // Set the final color with full opacity
//     gl_FragColor = vec4(finalColor, 1.0);
// }


//   // void main() {
//   //   //normalized device coordinates from -1 to 1
//   //   vec2 uv = (gl_FragCoord.xy - iResolution.xy - 0.5) / iResolution.y;

//   //   //time value
//   //   float t = iTime * speed;

//   //   uv *= scale;

//   //   float h = noise(vec3(uv * 2.0, t));

//   //   //uv distortion loop 
//   //   for (int n = 1; n < layers; n++){
//   //     float i = float(n);
//   //     uv -= vec2(0.7 / i * sin(i * uv.y + i + t * 5.0 + h * i) + 0.8, 0.4 / i * sin(uv.x+4.-i+h + t * 5.0 + 0.3 * i) + 1.6);
//   //   }

//   //   uv -= vec2(1.2 * sin(uv.x + t + h) + 1.8, 0.4 * sin(uv.y + t + 0.3 * h) + 1.6);

//   //   // Time varying pixel color
//   //   // vec3 col = vec3(
//   //   //   0.01 * sin(uv.x) + 0.1,
//   //   //   .01 * sin(uv.x) + 0.2,
//   //   //   0.9 * sin(uv.y + uv.x) + 0.9
//   //   // ) * iLight;
//   //   vec3 col = vec3(
//   //       0.8 * sin(uv.x + t) + 0.2,      // Red channel boosted
//   //       0.6 * sin(uv.x + t) + 0.3,      // Green channel moderate
//   //       0.01 * sin(uv.y + uv.x) + 0.8   // Blue channel reduced, maybe change this more
//   //   ) * iLight;

//   //   // Output to screen
//   //   gl_FragColor = vec4(col, iAlpha);
//   // }
//   // #define layers 2 //int how many layers

//   // uniform float iTime;
//   // uniform float iAlpha;
//   // uniform float iLight;
//   // uniform vec2 iResolution;
//   // uniform float scale;
//   // uniform float speed;

//   // varying vec2 vUv;
//   // varying vec3 vNormal;

//   // // ... [existing noise functions] ...

// //   void main() {
// //       // Normalized device coordinates from -1 to 1
// //       vec2 uv = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.y;

// //       // Time value
// //       float t = iTime * speed;

// //       uv *= scale;

// //       float h = noise(vec3(uv * 2.0, t));

// //       // UV distortion loop 
// //       for (int n = 1; n < layers; n++){
// //           float i = float(n);
// //           uv -= vec2(0.7 / i * sin(i * uv.y + i + t / densityFactor) + 0.8, 
// //                     0.4 / i * sin(uv.x + 4.0 - i + h + t / densityFactor + 0.3 * i) + 1.6);
// //       }

// //       uv -= vec2(1.2 * sin(uv.x + t + h) + 1.8, 
// //                 0.4 * sin(uv.y + t + 0.3 * h) + 1.6);

// //       // Time-varying pixel color adjusted to gold tones
// //       vec3 col = vec3(
// //           0.8 * sin(uv.x + t) + 0.2,      // Red channel boosted
// //           0.6 * sin(uv.x + t) + 0.3,      // Green channel moderate
// //           0.2 * sin(uv.y + uv.x) + 0.8   // Blue channel reduced
// //       ) * iLight;

// //       // Output to screen with adjusted alpha
// //       gl_FragColor = vec4(col, iAlpha);
// //   }

// // `

// export default fragment
const fragment = /* glsl */ `
  #define layers 2

  uniform float iTime;
  uniform float iAlpha;
  uniform float iLight;
  uniform vec2 iResolution;
  uniform float scale;
  uniform float speed;

  varying vec2 vUv;
  varying vec3 vNormal;

  float PI = 3.1415926535897932384626433832795;

  vec3 hash(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    p = -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    return p;
  }

  float noise(in vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    vec3 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(dot(hash(i + vec3(0.0,0.0,0.0)), f - vec3(0.0,0.0,0.0)), 
            dot(hash(i + vec3(1.0,0.0,0.0)), f - vec3(1.0,0.0,0.0)), u.x),
        mix(dot(hash(i + vec3(0.0,1.0,0.0)), f - vec3(0.0,1.0,0.0)), 
            dot(hash(i + vec3(1.0,1.0,0.0)), f - vec3(1.0,1.0,0.0)), u.x),
        u.y
      ),
      mix(
        mix(dot(hash(i + vec3(0.0,0.0,1.0)), f - vec3(0.0,0.0,1.0)),
            dot(hash(i + vec3(1.0,0.0,1.0)), f - vec3(1.0,0.0,1.0)), u.x),
        mix(dot(hash(i + vec3(0.0,1.0,1.0)), f - vec3(0.0,1.0,1.0)),
            dot(hash(i + vec3(1.0,1.0,1.0)), f - vec3(1.0,1.0,1.0)), u.x),
        u.y
      ),
    u.z );
  }

  void main() {
    // Normalized device coordinates (NDC) from -1 to 1
    vec2 uv = (gl_FragCoord.xy - iResolution.xy / 2.0) / iResolution.y;

    // Time value for animation
    float t = iTime * speed;

    uv *= scale;

    float h = noise(vec3(uv * 2.0, t));

    // UV distortion loop as before
    for (int n = 1; n < layers; n++) {
      float i = float(n);
      // Introduce subtle distortion just like original code
      uv -= vec2(
        0.7 / i * sin(i * uv.y + i + t * 5.0 + h * i) + 0.8,
        0.4 / i * sin(uv.x + 4.0 - i + h + t * 5.0 + 0.3 * i) + 1.6
      );
    }

    uv -= vec2(
      1.2 * sin(uv.x + t + h) + 1.8,
      0.4 * sin(uv.y + t + 0.3 * h) + 1.6
    );

    // Base darker gold color for better contrast
    vec3 baseGold = vec3(0.7, 0.6, 0.0);

    // Add subtle dynamic variations
    // Small amplitude sine waves to slightly alter the red/green channels:
    float r = baseGold.r + 0.1 * sin(uv.x * 0.5 + t);
    float g = baseGold.g + 0.1 * sin(uv.y * 0.5 + t * 1.2);
    float b = baseGold.b + 0.05 * sin((uv.x + uv.y) * 1.5 + t * 0.7);

    // Clamp values to ensure we stay within a gold-like range
    r = clamp(r, 0.5, 1.0);
    g = clamp(g, 0.5, 0.8);
    b = clamp(b, 0.0, 0.2);

    vec3 col = vec3(r, g, b) * iLight;

    // Output to screen with iAlpha for transparency control
    gl_FragColor = vec4(col, iAlpha);
  }
`;

export default fragment;
