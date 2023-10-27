import React, { MouseEvent } from "react"

export function Divider(props: { setToolWidth: (v: number) => void }) {
  return (
    <div
      className={"divider"}
      onMouseDown={() => {
        const hand = (e: MouseEvent<Window>) => {
          props.setToolWidth(e.clientX)
        }
        const unhand = () => {
          window.removeEventListener("mousemove", hand)
          window.removeEventListener("mouseup", unhand)
        }
        window.addEventListener("mousemove", hand)
        window.addEventListener("mouseup", unhand)
      }}
    >
      <div className={"handle"}></div>
    </div>
  )
}
