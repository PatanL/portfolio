const vertex = /* glsl */ `
  // switch on high precision floats
  // #ifdef GL_ES
  // precision highp float;
  // #endif

  // varying vec2 vUv;
  // varying vec3 vNormal;

  // void main() {
  //   vUv = uv;
  //   vNormal = normal;

  //   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  // }
  #ifdef GL_ES
  precision highp float;
  #endif

  varying vec2 vUv;
  varying vec3 vNormal;

  #include <common>
  #include <shadowmap_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>

  void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);

      #include <skinbase_vertex>
      #include <begin_vertex>
      #include <morphtarget_vertex>
      #include <skinning_vertex>
      #include <project_vertex>

      gl_Position = projectionMatrix * mvPosition;

      #include <shadowmap_vertex>
  }

`

export default vertex
