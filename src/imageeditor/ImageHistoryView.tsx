import React from "react"

import { SImage } from "../model/image"

export function ImageHistoryView(props: { image: SImage }) {
  return (
    <ul className={"history-view"}>
      {props.image.getHistory().map((h, i) => {
        return <li key={i}>{h.name()}</li>
      })}
    </ul>
  )
}
