import "./TestView.css"

import { HBox } from "josh_react_util"
import React, { useContext } from "react"

import { DocContext } from "../model/contexts"
import { GameTest } from "../model/datamodel"
import { TestMapPlayer } from "./TestMapPlayer"

export function TestModeView(props: { test: GameTest }) {
  const { test } = props
  const doc = useContext(DocContext)

  return (
    <>
      <HBox className={"tool-column"}>hi</HBox>
      <div className={"editor-view"}>{test && <TestMapPlayer doc={doc} test={test} />}</div>
    </>
  )
}
