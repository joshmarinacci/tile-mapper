import React from "react"
import { soundEffect } from "retrogami-engine"

import { useWatchAllProps } from "../model/base"
import { SoundFX } from "../model/soundfx"

let oldsc: OscillatorNode | undefined = undefined
let lastTime = Date.now()

const testSoundEffect = (fx: SoundFX) => {
  if (oldsc) {
    oldsc.stop()
  }
  if (Date.now() - lastTime < 250) {
    console.log("too soon")
    return
  }
  const frequency = fx.getPropValue("frequency")
  const peakVolume = fx.getPropValue("peakVolume")
  const attack = fx.getPropValue("attack")
  const decay = fx.getPropValue("decay")
  const pitchBendAmount = fx.getPropValue("pitchBend")
  const actx = new AudioContext()
  const osc = actx.createOscillator()
  osc.type = fx.getPropValue("oscilatorType")
  osc.frequency.value = frequency
  const vol = actx.createGain()
  osc.connect(vol)
  vol.connect(actx.destination)
  vol.gain.value = peakVolume
  // attack
  if (attack > 0) {
    vol.gain.value = 0
    vol.gain.linearRampToValueAtTime(0, actx.currentTime)
    vol.gain.linearRampToValueAtTime(peakVolume, actx.currentTime + attack)
  }
  // decay
  if (decay > 0) {
    vol.gain.linearRampToValueAtTime(peakVolume, actx.currentTime + attack)
    vol.gain.linearRampToValueAtTime(0, actx.currentTime + attack + decay)
  }
  // pitch bend
  osc.frequency.linearRampToValueAtTime(frequency, actx.currentTime)
  osc.frequency.linearRampToValueAtTime(
    frequency + pitchBendAmount,
    actx.currentTime + attack + decay,
  )

  osc.start(actx.currentTime)
  lastTime = Date.now()
  osc.stop(actx.currentTime + fx.getPropValue("duration") * 1000)
  oldsc = osc
}

export function SoundFXEditorView(props: { fx: SoundFX }) {
  const fx = props.fx

  useWatchAllProps(fx, () => {
    testSoundEffect(fx)
  })
  return (
    <>
      <div className={"vbox tool-column"}>sound effects toosl</div>
      <div className={"editor-view"}>
        sound effects editor
        <button onClick={() => testSoundEffect(fx)}> test </button>
      </div>
    </>
  )
}
