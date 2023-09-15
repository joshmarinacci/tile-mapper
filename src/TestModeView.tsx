import "./TestView.css"

import {HBox} from "josh_react_util"
import React, {useState} from "react"

import {DocModel, MapModel, TestModel} from "./defs"
import {ListView, ListViewRenderer} from "./ListView"
import {MapList} from "./MapList"
import {PropSheet} from "./propsheet"
import {GlobalState} from "./state"
import {TestMapPlayer} from "./TestMapPlayer"


const TestNameRenderer:ListViewRenderer<TestModel> = (props: {
    value: TestModel,
    selected: boolean,
}) => {
    return <div>{props.value.getPropValue('name')+""}</div>
}

function TestList(props: { test: TestModel|undefined, setTest: (value:TestModel) => void, editable: boolean, doc: DocModel }) {
    const {doc, test, setTest, editable} = props
    const add_test = () => {
        const test = TestModel.make()
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
    state: GlobalState
    doc: DocModel
}) {
    const {doc} = props
    const [test,setTest] = useState<TestModel>()
    const [map, setMap] = useState<MapModel>(props.doc.getMaps()[0])

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
