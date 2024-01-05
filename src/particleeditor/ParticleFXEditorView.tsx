import { Point, toRadians } from "josh_js_util"
import React, { useContext, useEffect, useRef, useState } from "react"
import {
  AnimationLayer,
  AnimationManager,
  Camera,
  Canvas,
  GameContext,
  ImageCache,
  ParticleAnim,
  StandardDrawingSurface,
} from "retrogami-engine"

import { ToggleButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { useWatchAllProps } from "../model/base"
import { ImageSnapshotContext } from "../model/contexts"
import { ParticleFX } from "../model/particlefx"

class AnimationProxy {
  private anims: AnimationManager
  private layer: AnimationLayer
  private canvas: HTMLCanvasElement
  private camera: Camera
  private t: number
  private particleAnim: ParticleAnim
  private fx: ParticleFX
  private image: HTMLCanvasElement
  private playing = false
  private timer: NodeJS.Timer
  private start_time: number

  constructor() {
    this.anims = new AnimationManager()
    this.layer = new AnimationLayer(this.anims)
    this.camera = new Camera()
    this.particleAnim = new ParticleAnim({
      source: new Point(0, 0),
    })
    this.t = 0
    this.fx = new ParticleFX()
  }

  draw() {
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    // console.log("updating anims",this.t, `duration = ${this.fx.getPropValue('duration')} playing=${this.playing}`)
    const gc: GameContext = {
      scale: 3,
      ctx: ctx,
      camera: this.camera,
      anim: this.anims,
      canvas: this.canvas,
      ic: new ImageCache(),
    }
    gc.surf = new StandardDrawingSurface(gc, ctx, this.t)
    if (this.fx.getPropValue("image")) {
      const ref = this.fx.getPropValue("image")
      gc.ic.addImage(ref, ref, this.image as Canvas)
    }
    if (this.playing) {
      this.anims.update(this.t)
      this.layer.drawSelf(gc.surf)
    } else {
      while (this.t < this.fx.getPropValue("duration")) {
        this.t += 0.01
        this.anims.update(this.t)
        this.layer.drawSelf(gc.surf)
      }
    }
  }

  start() {
    this.start_time = Date.now() / 1000
    this.t = 0
    this.timer = setInterval(() => {
      this.t = Date.now() / 1000 - this.start_time
      this.draw()
    }, 16)
  }

  stop() {
    clearInterval(this.timer)
  }
  reset(current: HTMLCanvasElement, fx: ParticleFX, image: HTMLCanvasElement) {
    this.canvas = current
    this.t = 0
    this.fx = fx
    this.image = image
    console.log("resetting particles")
    if (this.particleAnim) {
      this.anims.reset()
      this.anims.update(0)
    }
    this.particleAnim = this.anims.particles({
      source: fx.getPropValue("source"),
      angle: toRadians(fx.getPropValue("angle")),
      angleSpread: toRadians(fx.getPropValue("angleSpread")),

      duration: fx.getPropValue("duration"),
      infinite: fx.getPropValue("infinite"),

      image: fx.getPropValue("image"),
      color: fx.getPropValue("color"),
      size: fx.getPropValue("size"),

      maxAge: fx.getPropValue("maxAge"),
      fadeAge: fx.getPropValue("fadeAge"),

      maxParticles: fx.getPropValue("maxParticles"),
      initParticles: fx.getPropValue("initParticles"),

      rate: fx.getPropValue("rate"),
      velocity: fx.getPropValue("velocity"),
      velocitySpread: fx.getPropValue("velocitySpread"),
    })
  }

  setPlaying(playing: boolean) {
    this.playing = playing
    if (this.playing) {
      this.start()
    } else {
      this.stop()
    }
  }
}

const ANIM_PROXY = new AnimationProxy()

function ParticleSimView(props: { playing: boolean; fx: ParticleFX }) {
  const { fx, playing } = props
  const ref = useRef<HTMLCanvasElement>(null)
  const isc = useContext(ImageSnapshotContext)
  useEffect(() => {
    ANIM_PROXY.setPlaying(playing)
  }, [playing])
  const reset = () => {
    if (ref.current) {
      ANIM_PROXY.reset(ref.current, props.fx, isc.getSnapshotCanvas(props.fx.getPropValue("image")))
      ANIM_PROXY.setPlaying(props.playing)
      ANIM_PROXY.draw()
    }
  }
  useEffect(reset, [props.fx])
  useWatchAllProps(props.fx, reset)
  return (
    <canvas
      ref={ref}
      width={512}
      height={512}
      style={{
        border: "5px solid red",
      }}
    ></canvas>
  )
}

export function ParticleFXEditorView(props: { fx: ParticleFX }) {
  const [playing, setPlaying] = useState(false)
  // const [step, setStep] = useState(0)
  return (
    <>
      <div className={"vbox tool-column"}>particle tools</div>
      <div className={"editor-view"}>
        <div className={"toolbar"}>
          <ToggleButton
            onClick={() => setPlaying(!playing)}
            icon={Icons.Play}
            selected={playing}
            selectedIcon={Icons.Pause}
          />
          {/*<IconButton onClick={() => setStep(step + 1)} icon={Icons.Step} />*/}
        </div>
        <ParticleSimView playing={playing} fx={props.fx} />
      </div>
    </>
  )
}
