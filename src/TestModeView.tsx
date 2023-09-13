import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {MapImpl, TestImpl} from "./defs"
import {ListView} from "./ListView"
import {MapList} from "./MapList"
import {EditableDocument} from "./model"
import {PropSheet} from "./propsheet"
import {TestMapPlayer} from "./TestMapPlayer"


function TestNameRenderer(props: {
    value: TestImpl,
    selected: TestImpl,
    setSelected: (value: T) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getPropValue('name')+""}
    </div>
}

function TestList(props: { test: TestImpl|undefined, setTest: (value:TestImpl) => void, editable: boolean, doc: EditableDocument }) {
    const {doc, test, setTest, editable} = props
    const add_test = () => {
        const test = TestImpl.make()
        doc.addTest(test)
        setTest(test)
    }
    const del_test = () => {
        if(test) doc.removeTest(test)
        if(doc.getTests().length > 0) setTest(doc.getTests()[0])
    }
    return <div className={'pane'}>
        <header>tests</header>
        {editable &&
            <div className={'toolbar'}>
                <button onClick={add_test}>add test</button>
                <button onClick={del_test}>del test</button>
            </div> }
        <ListView selected={test}
                  setSelected={setTest}
                  renderer={TestNameRenderer}
                  data={doc.getTests()}
                  className={'test-list'} style={{}}/>
    </div>
}

export function TestModeView(props: {
    doc: EditableDocument
}) {
    const {doc} = props
    const [test,setTest] = useState<TestImpl>()
    const [map, setMap] = useState<MapImpl>(props.doc.getMaps()[0])

    return <>
        <HBox>
            <MapList map={map} setMap={setMap} doc={props.doc} editable={false}/>
            <TestList test={test} setTest={setTest} doc={props.doc} editable={true}/>
            {test && <PropSheet target={test} key={'props'}/>}
        </HBox>
        {map && test && <TestMapPlayer
            doc={doc}
            test={test}
            map={map}
            />}
    </>
}
