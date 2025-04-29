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

type AnimationProps = { a: AnimationAction; delay?: number }
type AnimationConfig = { enter: AnimationProps; loop?: AnimationProps }

// exactly the set of sections that have animations
type ActionKey = 'intro' | 'hero' | 'portfolio' | 'about' | 'contact' | 'menu'
type AnimationDictionary = Record<ActionKey, AnimationConfig>

export default class Man {
  private experience: Experience
  private scene: THREE.Scene
  private resources: Experience['resources']
  private sizes: Experience['sizes']
  private time: Experience['time']
  private renderer: THREE.WebGLRenderer
  private resource: LoadResult

  /** GLTF scene root, assumed Group to traverse */
  public model!: THREE.Group

  /** first mesh (used elsewhere?) */
  public mesh!: THREE.Mesh

  /** the mixer we use for all clips */
  private mixer!: THREE.AnimationMixer

  /** dictionary of all our enter/loop actions */
  private actions!: AnimationDictionary

  /** the currently playing action */
  private currentAction!: AnimationAction

  /** accumulated actions that finished but have not yet been stopped */
  private finishedAnimations: AnimationAction[] = []

  /** flag to gate scrolling behavior */
  private scroll = false

  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.resource = this.resources.items.manModel
    this.sizes = this.experience.sizes
    this.time = this.experience.time
    this.renderer = this.experience.renderer.instance

    this.setModel()
    this.setMaterial()

    const watcher = new StoreWatcher()
    watcher.addListener(this.stateChangeHandler.bind(this))
  }

  private setModel() {
    if (!this.resource.scene) return
    // force-cast to Group so TS knows it has children[]
    this.model = this.resource.scene as unknown as THREE.Group
    this.scene.add(this.model)
  }

  private setMaterial() {
    const name = manMaterial as string
    let mats: THREE.Material[]

    switch (name) {
      case 'magicalMarble': mats = magicalMarble(); break
      case 'glow':          mats = glow();          break
      case 'outline':       mats = outline();       break
      case 'lambert':       mats = lambert();       break
      case 'vibrant':       mats = vibrant();       break
      default:              mats = [new THREE.MeshStandardMaterial({ color: 0x398424 })]
    }

    // apply material(s) to every mesh in the gltf
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh
        m.castShadow = false
        m.receiveShadow = false
        m.material = name === 'outline' ? mats : mats[0]
      }
    })

    // grab one mesh reference for later use
    const first = this.model.getObjectByProperty('type','Mesh') as THREE.Mesh
    if (!first) throw new Error('No mesh found to assign to this.mesh')
    this.mesh = first
  }

  private stateChangeHandler(state: RootState, prev: RootState) {
    // 1) App ready → kick off the clip set
    if (state.app.ready && !prev.app.ready) {
      this.startAnimations()
    }

    // 2) Section changed → crossfade or play
    const prevSec = prev.section.current as ActionKey
    const curSec  = state.section.current as ActionKey
    if (curSec !== prevSec) {
      const nextEnter = this.actions[curSec].enter.a
      if (this.currentAction.isRunning()) {
        this.crossFade(nextEnter, this.currentAction)
      } else {
        this.playAction(nextEnter)
      }
    }

    // 3) Menu toggle → always crossfade to menu.enter or back
    if (state.menu.open !== prev.menu.open) {
      const menuEnter = this.actions.menu.enter.a
      if (state.menu.open) {
        // fade out whatever’s running into menu
        this.crossFade(menuEnter, this.currentAction)
      } else {
        // fade back into the section we’re on
        const idx = state.menu.index
        const sec: ActionKey = state.section.sections[idx].id as ActionKey
        this.crossFade(this.actions[sec].enter.a, menuEnter)
      }
    }
  }

  private startAnimations() {
    if (!this.resource.animations?.length) return

    // make the mixer & master clip
    this.mixer = new THREE.AnimationMixer(this.model)
    const masterAction = this.mixer.clipAction(this.resource.animations[0])
    const masterClip   = masterAction.getClip()
    const subclip      = THREE.AnimationUtils.subclip

    // build our dictionary
    this.actions = {
      intro:     { enter: { a: this.mixer.clipAction(subclip(masterClip,'intro',        0,  80)) } },
      hero:      {
        enter: { a: this.mixer.clipAction(subclip(masterClip,'hero',        80, 260)) },
        loop:  { a: this.mixer.clipAction(subclip(masterClip,'hero.loop', 260, 610)) }
      },
      portfolio: {
        enter: { a: this.mixer.clipAction(subclip(masterClip,'portfolio', 610, 690)) },
        loop:  { a: this.mixer.clipAction(subclip(masterClip,'portfolio.loop',690,770)) }
      },
      about:     {
        enter: { a: this.mixer.clipAction(subclip(masterClip,'about',      770, 820)) },
        loop:  { a: this.mixer.clipAction(subclip(masterClip,'about.loop',820,870)) }
      },
      contact:   {
        enter: { a: this.mixer.clipAction(subclip(masterClip,'contact',   870, 910)) },
        loop:  { a: this.mixer.clipAction(subclip(masterClip,'contact.loop',910,1060)) }
      },
      menu:      { enter: { a: this.mixer.clipAction(subclip(masterClip,'menu.loop',1060,1150)) } }
    }

    // when any action finishes, we may need to chain into the loop or next
    this.mixer.addEventListener('finished', this.handleAnimationFinish.bind(this))

    // start with “intro”
    this.playAction(this.actions.intro.enter.a)
  }

  private handleAnimationFinish(evt: THREE.Event) {
    const finished = ((evt as any).action) as AnimationAction
    // ignore if it was already crossfaded
    if (finished.getEffectiveWeight() < 1) return

    // queue it to stop after fade
    this.finishedAnimations.push(finished)

    const name = finished.getClip().name.replace(/\.loop$/, '')
    const cfg  = this.actions as any

    if (name === 'intro') {
      setTimeout(() => this.playAction(cfg.hero.enter.a), 300)
    } else if (cfg[name]?.loop) {
      this.playAction(cfg[name].loop.a)
    }

    // on intro end, re-enable page scroll
    this.scroll = window.store.getState().scroll
    if (!this.scroll && name === 'intro') {
      window.store.dispatch.scroll.canScroll()
    }
  }

  private playAction(next: AnimationAction) {
    next.reset()
    if (!next.getClip().name.includes('loop')) {
      next.clampWhenFinished = true
      next.setLoop(THREE.LoopOnce, 1)
    }
    if (showManAnimationLogs) console.log(`${next.getClip().name} play()`)
    next.play()

    // stop any stale actions
    for (const fn of this.finishedAnimations) {
      requestAnimationFrame(() => fn.stop())
    }
    this.finishedAnimations = []

    // record now-playing
    this.currentAction = next
  }

  private crossFade(next: AnimationAction, prev: AnimationAction) {
    next.reset()
    if (showManAnimationLogs) {
      console.log(`${next.getClip().name} crossFadeFrom(${prev.getClip().name})`)
    }
    next.crossFadeFrom(prev, 1, false).play()

    // same cleanup
    for (const fn of this.finishedAnimations) {
      requestAnimationFrame(() => fn.stop())
    }
    this.finishedAnimations = []

    this.currentAction = next
  }

  public update() {
    const dt = this.time.delta * 0.001
    this.mixer?.update(dt)
  }

  public resize() {
    // no‐op
  }
}