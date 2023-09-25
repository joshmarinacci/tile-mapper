import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useContext, useState} from "react"

import {DocContext} from "./common-components"
import {GameMap, GameTest} from "./datamodel"
import {GlobalState} from "./state"
import {TestMapPlayer} from "./TestMapPlayer"


export function TestModeView(props: {
    state: GlobalState
    test: GameTest
}) {
    const {state, test} = props
    const doc = useContext(DocContext)
    const [map, setMap] = useState<GameMap>(doc.getPropValue('maps')[0])

    return <div>
        <HBox>
        </HBox>
        {map && test && <TestMapPlayer
            doc={doc}
            test={test}
            map={map}
            />}
    </div>
}
