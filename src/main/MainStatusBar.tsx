import { Spacer } from "josh_react_util"
import React, { useContext, useState } from "react"

import { left_arrow_triangle, right_arrow_triangle } from "../common/common"
import { StateContext } from "../common/common-components"

export function MainStatusBar() {
  const state = useContext(StateContext)
  const [showLeft, setShowLeft] = useState(state.getPropValue("showLeft"))
  const [showRight, setShowRight] = useState(state.getPropValue("showRight"))
  return (
    <div className={"bottom-statusbar hbox"}>
      <button
        onClick={() => {
          console.log("setting to", !showLeft)
          setShowLeft(!showLeft)
          state.setPropValue("showLeft", !showLeft)
        }}
      >
        {showLeft ? left_arrow_triangle : right_arrow_triangle}
      </button>
      <Spacer />
      <label>greetings, earthling!</label>
      <Spacer />
      <button
        onClick={() => {
          setShowRight(!showRight)
          state.setPropValue("showRight", !showRight)
        }}
      >
        {showRight ? right_arrow_triangle : left_arrow_triangle}
      </button>
    </div>
  )
}
