import { Spacer } from "josh_react_util"
import React, { ReactNode, useState } from "react"

import { left_arrow_triangle, right_arrow_triangle } from "./common"

export function MainView(props: {
  toolbar: ReactNode
  left: ReactNode
  center: ReactNode
  right: ReactNode
}) {
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const style = {
    display: "grid",
    gridTemplateColumns: `${showLeft ? "[left-column] 10rem" : ""} [center-column] 1fr ${
      showRight ? "[right-column] 15rem" : ""
    } [end-column]`,
    gridTemplateRows: "2rem auto 2rem",
    width: "99vw",
    height: "99vh",
  }
  return (
    <div style={style}>
      {props.toolbar}
      {showLeft && props.left}
      {props.center}
      {showRight && props.right}
      <div className={"toolbar across"}>
        <button onClick={() => setShowLeft(!showLeft)}>
          {showLeft ? left_arrow_triangle : right_arrow_triangle}
        </button>
        <Spacer />
        <label>greetings, earthling!</label>
        <Spacer />
        <button onClick={() => setShowRight(!showRight)}>
          {showRight ? right_arrow_triangle : left_arrow_triangle}
        </button>
      </div>
    </div>
  )
}
