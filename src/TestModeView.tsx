import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {GameDoc, GameMap, GameTest} from "./datamodel"
import {GlobalState} from "./state"
import {TestMapPlayer} from "./TestMapPlayer"


export function TestModeView(props: {
    state: GlobalState
    doc: GameDoc
    test: GameTest
}) {
    const {doc, state, test} = props
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
