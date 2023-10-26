import "./TestView.css"

import { HBox } from "josh_react_util"
import React, { useContext } from "react"

import { DocContext } from "../common/common-components"
import { GameTest } from "../model/datamodel"
import { TestMapPlayer } from "./TestMapPlayer"

export function TestModeView(props: { test: GameTest }) {
  const { test } = props
  const doc = useContext(DocContext)

  return (
    <div>
      <HBox>hi</HBox>
      {test && <TestMapPlayer doc={doc} test={test} />}
    </div>
  )
}
