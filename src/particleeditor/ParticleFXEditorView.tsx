import { Point, toRadians } from "josh_js_util"
import React, { useEffect, useRef, useState } from "react"
import { AnimationLayer, AnimationManager, Camera, ParticleAnim } from "retrogami-engine"

import { Icons } from "../common/common"
import { IconButton } from "../common/common-components"
import { useWatchAllProps } from "../model/base"
import { ParticleFX } from "../model/particlefx"

class AnimationProxy {
  private anims: AnimationManager
  private layer: AnimationLayer
  private canvas: HTMLCanvasElement
  private timer: NodeJS.Timer
  private camera: Camera
  private t: number
  private particleAnim: ParticleAnim | undefined
  constructor() {
    this.anims = new AnimationManager()
    this.layer = new AnimationLayer(this.anims)
    this.camera = new Camera()
    this.t = 0
  }
  resetParticles(params: ParticleFX) {
    if (this.particleAnim) {
      this.particleAnim.stop()
    }
    this.particleAnim = this.anims.particles({
      position: new Point(50, 50),
      color: params.getPropValue("color"),
      rate: params.getPropValue("rate"),
      size: params.getPropValue("size"),
      maxAge: params.getPropValue("maxAge"),
      duration: params.getPropValue("duration"),
      maxParticles: params.getPropValue("maxParticles"),
      angle: toRadians(params.getPropValue("angle")),
      angleSpread: toRadians(params.getPropValue("angleSpread")),
      velocity: params.getPropValue("velocity"),
      velocitySpread: params.getPropValue("velocitySpread"),
      infinite: params.getPropValue("infinite"),
    })
  }
  draw() {
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    // console.log('drawing at',t,particleAnim.particles.length)
    // if(particleAnim.particles.length > 0) {
    //     console.log(particleAnim.particles[0].position, camera.viewport)
    // }
    // particleAnim.update(props.step)
    // particleAnim.draw(ctx,camera,5)
    this.anims.update(this.t)
    this.layer.drawSelf(ctx, this.camera, null, null, 3)
    // console.log("anim count", this.anims.runningAnimationCount())
    if (this.particleAnim) {
      // console.log(this.particleAnim.isRunning(), this.particleAnim.currentParticleCount())
    }
  }

  setCanvas(current: HTMLCanvasElement) {
    this.canvas = current
  }

  start() {
    this.t = Date.now()
    this.timer = setInterval(() => {
      this.t = Date.now()
      this.draw()
    }, 30)
  }

  stop() {
    clearInterval(this.timer)
  }
}
const ANIM_PROXY = new AnimationProxy()

function ParticleSimView(props: { playing: boolean; step: number; fx: ParticleFX }) {
  const ref = useRef<HTMLCanvasElement>(null)
  // useEffect(() => {
  //     if(ref.current) {
  //         ANIM_PROXY.setCanvas(ref.current)
  //         ANIM_PROXY.resetParticles(props.fx)
  //         if(props.playing) {
  //             ANIM_PROXY.start()
  //         } else {
  //             ANIM_PROXY.stop()
  //         }
  //     }
  // }, [props.playing])
  // useEffect(() => {
  //     if(ref.current) {
  //         ANIM_PROXY.setCanvas(ref.current)
  //         ANIM_PROXY.stop()
  //         ANIM_PROXY.resetParticles(props.fx)
  //         // ANIM_PROXY.step()
  //     }
  // }, [props.step])
  useWatchAllProps(props.fx, () => {
    console.log("fx changed")
    if (ref.current) {
      ANIM_PROXY.setCanvas(ref.current)
      ANIM_PROXY.resetParticles(props.fx)
      ANIM_PROXY.stop()
      ANIM_PROXY.start()
    }
  })
  return <canvas ref={ref} width={512} height={512}></canvas>
}

export function ParticleFXEditorView(props: { fx: ParticleFX }) {
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(0)
  return (
    <>
      <div className={"vbox tool-column"}>particle tools</div>
      <div className={"editor-view"}>
        <div className={"toolbar"}>
          <IconButton onClick={() => setPlaying(!playing)} icon={Icons.Actor} />
          <IconButton onClick={() => setStep(step + 1)} icon={Icons.Actor} />
        </div>
        <ParticleSimView playing={playing} step={step} fx={props.fx} />
      </div>
    </>
  )
}
