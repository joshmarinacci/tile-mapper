import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {useObservableChange} from "./common-components"
import {ListView} from "./ListView"
import {MapList} from "./MapList"
import {Changed, EditableDocument, EditableMap, EditableTest} from "./model"
import {TestMapPlayer} from "./TestMapPlayer"


function TestNameRenderer(props: {
    value: EditableTest,
    selected: any,
    setSelected: (value: any) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getName()}
    </div>
}

function TestList(props: { test: EditableTest|undefined, setTest: (value:EditableTest) => void, editable: boolean, doc: EditableDocument }) {
    const {doc, test, setTest, editable} = props
    const add_test = () => {
        const test = new EditableTest()
        doc.addTest(test)
        setTest(test)
    }
    const del_test = () => {
        doc.removeTest(test)
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

function TestDetails(props: { test: EditableTest, doc: EditableDocument }) {
    const {test} = props
    useObservableChange(test,Changed)
    return <div className={'pane'}>
        <header>Test Details</header>
        <ul className={'props-sheet'}>
            <li>
                <b>width</b>
                <input type={"number"} value={test.viewport.w} onChange={(e) => {
                    test.setWidth(parseInt(e.target.value))
                }}/>
            </li>
            <li>
                <b>height</b>
                <input type={"number"} value={test.viewport.h} onChange={(e) => {
                    test.setHeight(parseInt(e.target.value))
                }}/>
            </li>
            <li>
                <b>name</b>
                <input type={'text'}
                       value={test.getName()}
                       onChange={(e) => test.setName(e.target.value)}/>
            </li>
        </ul>
    </div>
}

export function TestModeView(props: {
    doc: EditableDocument
}) {
    const {doc} = props
    const [test,setTest] = useState<EditableTest>()
    const [map, setMap] = useState<EditableMap>(props.doc.getMaps()[0])

    return <>
        <HBox>
            <MapList map={map} setMap={setMap} doc={props.doc} editable={false}/>
            <TestList test={test} setTest={setTest} doc={props.doc} editable={true}/>
            {test && <TestDetails test={test} doc={props.doc}/>}
        </HBox>
        {map && test && <TestMapPlayer
            doc={doc}
            test={test}
            map={map}
            />}
    </>
}
