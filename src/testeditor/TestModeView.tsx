import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useContext, useState} from "react"

import {DocContext} from "../common/common-components"
import {GameMap, GameTest} from "../model/datamodel"
import {GlobalState} from "../state"
import {TestMapPlayer} from "./TestMapPlayer"


export function TestModeView(props: {
    state: GlobalState
    test: GameTest
}) {
    const { test} = props
    const doc = useContext(DocContext)
    const [map] = useState<GameMap>(doc.getPropValue('maps')[0])

    return <div>
        <HBox>
            hi
        </HBox>
        {map && test && <TestMapPlayer
            doc={doc}
            test={test}
            map={map}
            />}
    </div>
}
