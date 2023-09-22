import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {Doc2, Map2, Test2} from "./datamodel"
import {GlobalState} from "./state"
import {TestMapPlayer} from "./TestMapPlayer"


export function TestModeView(props: {
    state: GlobalState
    doc: Doc2
    test: Test2
}) {
    const {doc, state, test} = props
    const [map, setMap] = useState<Map2>(doc.getPropValue('maps')[0])

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
