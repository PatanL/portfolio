// Types
import type { RootState } from 'store'

// Utils
import * as THREE from 'three'
import { gsap } from 'gsap'
import StoreWatcher from '../utils/StoreWatcher'
import { betweenRange, toFixedNumber } from 'utils/math'

// Components
import Experience from '../Experience'

// Settings
import { showOrbitControls, showCameraPath } from 'settings'

// Replace "Sections" with your actual type or interface for section IDs.
type Sections = 'hero' | 'about' | 'portfolio' | 'menu' | string

export default class CameraOnPath {
  experience: Experience
  scene: Experience['scene']
  sizes: Experience['sizes']
  
  renderer: Experience['renderer']
  appReady: RootState['app']['ready']
  points: [number, number, number][]
  vertices!: THREE.Vector3[]
  camera!: THREE.PerspectiveCamera
  cameraHelper!: THREE.CameraHelper
  curvePath!: THREE.CatmullRomCurve3
  percentage: number
  bodyHeight?: number
  menuOpen: boolean
  snapshot: {
    sectionId: Sections
    lookAt: THREE.Vector3
    position: THREE.Vector3
  }
  lookAt: {
    [key: string]: THREE.Vector3
  }

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.sizes = this.experience.sizes
    this.renderer = this.experience.renderer

    this.menuOpen = false
    this.snapshot = {
      sectionId: 'hero',
      lookAt: new THREE.Vector3(),
      position: new THREE.Vector3()
    }
    this.appReady = false

    // Adjustments for the camera path (stationary)
    const xAdjustment = 1 // Adjust the horizontal position (X-axis) left and right
    const yAdjustment = -0.5 // Adjust the vertical position (Y-axis), how close i am with the model
    const zAdjustment = 6 // Adjust the depth (Z-axis)

    // Define the points so that every point is the same
    this.points = [
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
      [0 + xAdjustment, 0 + yAdjustment, 0 + zAdjustment],
    ];

    this.vertices = []
    // Set the lookAt targets.
    // We want the camera to always look at (0,0,0), so we set current to (0,0,0)
    this.lookAt = {
      current: new THREE.Vector3(0, 0, 0),
      body: new THREE.Vector3(0, 0, 0),
      portfolio: new THREE.Vector3(0, 10, -2),
      about: new THREE.Vector3(0, 10, -2),
      menu: new THREE.Vector3(0, 0, 0)
    }
    this.percentage = 0

    this.setCamera()
    this.setPath()

    const storeWatcher = new StoreWatcher()
    storeWatcher.addListener(this.stateChangeHandler.bind(this))
  }

  stateChangeHandler(state: RootState, prevState: RootState) {
    // App ready
    if (state.app.ready !== prevState.app.ready) {
      this.appReady = state.app.ready

      const index = this.vertices.length - 1
      gsap.to(this.camera.position, {
        x: this.vertices[index].x,
        y: this.vertices[index].y,
        z: this.vertices[index].z,
        duration: 3.5,
        ease: 'power3.inOut'
      })

      gsap.to(this.lookAt.current, {
        x: 0,
        y: 0,
        z: 0,
        duration: 3.5,
        ease: 'power3.inOut'
      })
    }

    // Scroll / bodyHeight update (we still update bodyHeight for potential future use)
    if (state.scroll !== prevState.scroll) {
      this.bodyHeight = window.document.body.clientHeight - this.sizes.height
    }

    // Menu
    if (state.menu.open !== prevState.menu.open) {
      gsap.killTweensOf(this.camera.position, 'x,y,z')
      gsap.killTweensOf(this.lookAt.current, 'x,y,z')

      if (state.menu.open) {
        this.snapshot = {
          sectionId: state.section.current,
          position: this.camera.position.clone(),
          lookAt: this.lookAt.current.clone()
        }
        this.menuOpen = true

        gsap.to(this.camera.position, {
          x: 6,
          y: 5,
          z: 6,
          duration: 3,
          ease: 'power4.out'
        })
        gsap.to(this.lookAt.current, {
          x: this.lookAt.menu.x,
          y: this.lookAt.menu.y,
          z: this.lookAt.menu.z,
          duration: 3,
          ease: 'power4.out'
        })
      } else {
        // Menu is closing
        let position: THREE.Vector3
        let lookAt: THREE.Vector3

        const newSectionId = state.section.sections[state.menu.index].id

        if (newSectionId === this.snapshot.sectionId) {
          position = this.snapshot.position
          lookAt = this.snapshot.lookAt
        } else {
          const newScroll = state.section.boundaries[state.menu.index].start
          const relativeScroll = 1 - newScroll / (this.bodyHeight || 0)
          this.percentage = betweenRange(relativeScroll, 0, 1)
          position = this.curvePath.getPointAt(this.percentage)

          if (newSectionId === 'about') {
            lookAt = this.lookAt.about
          } else if (newSectionId === 'portfolio') {
            lookAt = this.lookAt.portfolio
          } else {
            lookAt = this.lookAt.body
          }
        }

        gsap.to(this.camera.position, {
          x: position.x,
          y: position.y,
          z: position.z,
          duration: 3,
          ease: 'power3.out',
          onComplete: () => {
            this.menuOpen = false
          }
        })
        gsap.to(this.lookAt.current, {
          x: lookAt.x,
          y: lookAt.y,
          z: lookAt.z,
          duration: 3,
          ease: 'power3.out'
        })
      }
    }

    // Section changes
    if (state.section.current !== prevState.section.current) {
      gsap.killTweensOf(this.lookAt.current, 'x,y,z')
      const duration = 1
      const ease = 'power2.inOut'
      // For section changes, force lookAt.current to be (0,0,0)
      gsap.to(this.lookAt.current, {
        x: 0,
        y: 0,
        z: 0,
        duration,
        ease
      })
    }
  }

  setCamera() {
    const { width, height } = this.sizes
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10)

    // Set the camera at a fixed initial position
    this.camera.position.set(0, -1, -2)
    // Always have the camera look at (0,0,0)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))
    this.scene.add(this.camera)

    if (showOrbitControls) {
      this.cameraHelper = new THREE.CameraHelper(this.camera)
      this.scene.add(this.cameraHelper)
    }
  }

  setPath() {
    // Convert the array of points (all identical) into vertices
    for (let i = 0; i < this.points.length; i++) {
      const x = this.points[i][0] - 1.5
      const y = this.points[i][1] - 1.2
      const z = this.points[i][2] - 2.5 // Altezza

      this.vertices[i] = new THREE.Vector3(x, z, -y)
    }

    // Create a curve path from the vertices (all points are identical, so the curve is a single point)
    this.curvePath = new THREE.CatmullRomCurve3(this.vertices)
    const radius = 0.1
    const geometry = new THREE.TubeGeometry(this.curvePath, 50, radius, 10, false)
    const material = new THREE.MeshBasicMaterial({
      wireframe: true,
      visible: showCameraPath,
      transparent: true,
      opacity: 1.0
    })
    const tube = new THREE.Mesh(geometry, material)
    this.scene.add(tube)
  }

  update() {
    if (!this.appReady) return

    this.camera.updateProjectionMatrix()

    // Always have the camera look at (0,0,0)
    this.camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Since the camera path is stationary,
    // we are not updating the camera's position based on scroll.
    if (showOrbitControls) {
      this.cameraHelper.update()
    }
  }

  resize() {
    this.bodyHeight = window.document.body.clientHeight - this.sizes.height

    const { width, height } = this.sizes
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
