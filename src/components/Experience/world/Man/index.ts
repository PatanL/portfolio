import * as THREE from 'three'

// Types
import type { LoadResult } from '../../utils/Resources'
import type { RootState } from 'store'

// Settings & Utils
import { showManAnimationLogs, manMaterial } from 'settings'
import Experience from '../../Experience'
import StoreWatcher from '../../utils/StoreWatcher'
import { betweenRange, toFixedNumber } from 'utils/math'

// Materials
import magicalMarble from './materials/MagicalMarble'
import glow from './materials/Glow'
import outline from './materials/Outline'
import lambert from './materials/Lambert'
import vibrant from './materials/Vibrant'

interface AnimationAction extends THREE.AnimationAction {
  _clip?: THREE.AnimationClip
}

type AnimationProps = {
  a: AnimationAction
  delay?: number
}

type AnimationConfig = {
  enter: AnimationProps
  loop?: AnimationProps
}

type AnimationConfigTypes = {
  current?: AnimationAction
  intro: AnimationConfig
  hero: AnimationConfig
  portfolio: AnimationConfig
  about: AnimationConfig
  contact: AnimationConfig
  menu: AnimationConfig
}

type Sections = 'hero' | 'about' | 'portfolio' | 'contact' | 'menu' | string

export default class Man {
  experience: Experience
  scene: THREE.Scene
  resources: Experience['resources']
  sizes: Experience['sizes']
  time: Experience['time']
  resource: LoadResult
  renderer: THREE.WebGLRenderer

  model!: THREE.Group
  mesh!: THREE.Mesh

  animation!: {
    mixer: THREE.AnimationMixer
    actions: AnimationConfigTypes
  }
  animationBeforeMenuOpen!: AnimationAction
  finishedAnimations: AnimationAction[]
  scroll: boolean

  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.resources
    this.resource = this.resources.items.manModel
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.renderer = this.experience.renderer.instance

    this.scroll = false
    this.finishedAnimations = []

    this.setModel()
    this.setMaterial()

    const storeWatcher = new StoreWatcher()
    storeWatcher.addListener(this.stateChangeHandler.bind(this))
  }

  private setModel() {
    if (!this.resource.scene) return
    this.model = this.resource.scene
    this.scene.add(this.model)
  }

  private setMaterial() {
    const materialName = manMaterial as string
    let chosenMaterials: THREE.Material[]

    switch (materialName) {
      case 'magicalMarble':
        chosenMaterials = magicalMarble()
        break
      case 'glow':
        chosenMaterials = glow()
        break
      case 'outline':
        chosenMaterials = outline()
        break
      case 'lambert':
        chosenMaterials = lambert()
        break
      case 'vibrant':
        chosenMaterials = vibrant()
        break
      default:
        chosenMaterials = [new THREE.MeshStandardMaterial({ color: 0x398424 })]
    }

    // Apply materials to every mesh in the model
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = false
        mesh.receiveShadow = false

        if (materialName === 'outline') {
          // outline() returns an array of materials for different groups
          mesh.material = chosenMaterials
        } else {
          // use the first material for all other cases
          mesh.material = chosenMaterials[0]
        }
      }
    })

    // Keep a reference to the first actual Mesh
    const firstMesh = this.model.getObjectByProperty('type', 'Mesh') as THREE.Mesh
    if (!firstMesh) {
      throw new Error('No Mesh found in model to apply material to')
    }
    this.mesh = firstMesh
  }

  private stateChangeHandler(state: RootState, prevState: RootState) {
    // App ready → start animations
    if (state.app.ready && !prevState.app.ready) {
      this.startAnimations()
    }

    // Section change
    const prevSection = prevState.section.current
    const currentSection = state.section.current as Sections
    if (currentSection !== prevSection) {
      const next = this.animation.actions[currentSection]?.enter.a
      const prev = this.animation.actions.current
      if (prev?.isRunning()) {
        this.crossFade(next, prev)
      } else {
        this.playAction(next)
      }
    }

    // Menu open/close
    if (state.menu.open !== prevState.menu.open) {
      const menuEnter = this.animation.actions.menu.enter.a
      const current = this.animation.actions.current
      if (state.menu.open) {
        this.animationBeforeMenuOpen = current!
        this.crossFade(menuEnter, current!)
      } else {
        const idx = state.menu.index
        const nextSection = state.section.sections[idx].id as Sections
        const nextEnter = this.animation.actions[nextSection]?.enter.a
        this.crossFade(nextEnter, menuEnter)
      }
    }
  }

  private startAnimations() {
    if (!this.resource.animations?.length) return
    const mixer = new THREE.AnimationMixer(this.model)
    const master = mixer.clipAction(this.resource.animations[0])
    const clip = master.getClip()
    const sub = THREE.AnimationUtils.subclip

    this.animation = {
      mixer,
      actions: {
        intro: { enter: { a: mixer.clipAction(sub(clip, 'intro', 0, 80)) } },
        hero: {
          enter: { a: mixer.clipAction(sub(clip, 'hero', 80, 260)) },
          loop: { a: mixer.clipAction(sub(clip, 'hero.loop', 260, 610)) }
        },
        portfolio: {
          enter: { a: mixer.clipAction(sub(clip, 'portfolio', 610, 690)) },
          loop: { a: mixer.clipAction(sub(clip, 'portfolio.loop', 690, 770)) }
        },
        about: {
          enter: { a: mixer.clipAction(sub(clip, 'about', 770, 820)) },
          loop: { a: mixer.clipAction(sub(clip, 'about.loop', 820, 870)) }
        },
        contact: {
          enter: { a: mixer.clipAction(sub(clip, 'contact', 870, 910)) },
          loop: { a: mixer.clipAction(sub(clip, 'contact.loop', 910, 1060)) }
        },
        menu: { enter: { a: mixer.clipAction(sub(clip, 'menu.loop', 1060, 1150)) } }
      }
    }

    this.animation.mixer.addEventListener('finished', this.handleAnimationFinish.bind(this))
    this.playAction(this.animation.actions.intro.enter.a)
  }

  private handleAnimationFinish(event: THREE.Event) {
    const action = (event as any).action as AnimationAction
    if (action.getEffectiveWeight() < 1) return

    this.finishedAnimations.push(action)

    const name = action.getClip().name
    const base = name.replace(/\.loop$/, '')
    const cfg = this.animation.actions as any

    if (base === 'intro') {
      setTimeout(() => this.playAction(cfg.hero.enter.a), 300)
    } else if (cfg[base]?.loop) {
      this.playAction(cfg[base].loop.a)
    }

    this.scroll = window.store.getState().scroll
    if (!this.scroll && name === 'intro') {
      window.store.dispatch.scroll.canScroll()
    }
  }

  private playAction(anim: AnimationAction) {
    anim.reset()
    if (!anim.getClip().name.includes('loop')) {
      anim.clampWhenFinished = true
      anim.setLoop(THREE.LoopOnce, 1)
    }
    if (showManAnimationLogs) console.log(`${anim.getClip().name} play()`)
    anim.play()
    this.stopFinished()
    this.animation.actions.current = anim
  }

  private crossFade(next: AnimationAction, prev: AnimationAction) {
    next.reset()
    if (showManAnimationLogs) {
      console.log(
        `${next.getClip().name} crossFadeFrom(${prev.getClip().name})`
      )
    }
    next.crossFadeFrom(prev, 1, false).play()
    this.stopFinished()
    this.animation.actions.current = next
  }

  private stopFinished() {
    for (const fn of this.finishedAnimations) {
      requestAnimationFrame(() => {
        if (showManAnimationLogs)
          console.log(`${fn.getClip().name} stop()`)
        fn.stop()
      })
    }
    this.finishedAnimations = []
  }

  update() {
    const delta = this.time.delta * 0.001
    this.animation?.mixer?.update(delta)
  }

  resize() {
    // no-op
  }
}