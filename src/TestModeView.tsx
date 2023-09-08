import {Size} from "josh_js_util"
import {HBox} from "josh_react_util"
import React, {useEffect, useRef, useState} from "react"

import {useObservableChange} from "./common-components"
import {ListView} from "./ListView"
import {MapList} from "./MapList"
import {Changed, drawEditableSprite, EditableDocument, EditableMap, EditableTest} from "./model"


function TestNameRenderer(props: {
    value: EditableTest,
    selected: any,
    setSelected: (value: any) => void
}) {
    return <div onClick={() => props.setSelected(props.value)}>
        {props.value.getName()}
    </div>
}

function TestList(props: { test: EditableTest, setTest: (value: (((prevState: (EditableTest | undefined)) => (EditableTest | undefined)) | EditableTest | undefined)) => void, editable: boolean, doc: EditableDocument }) {
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

function drawViewport(current:HTMLCanvasElement, test: EditableTest, map: EditableMap, doc:EditableDocument) {
    const ctx = current.getContext('2d') as CanvasRenderingContext2D
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = 'red'
    ctx.fillRect(0, 0, current.width, current.height)
    const size = new Size(10,10)
    const scale = 4
    map.cells.forEach((v, n) => {
        const pos = n.scale(size.w).scale(scale)
        const tile = doc.lookup_sprite(v.tile)
        if(tile) {
            if(tile.cache_canvas) {
                ctx.drawImage(tile.cache_canvas,
                    //src
                    0,0,tile.cache_canvas.width,tile.cache_canvas.height,
                    //dst
                    pos.x,
                    pos.y,
                    size.w*scale,size.h*scale
                )
            } else {
                drawEditableSprite(ctx, scale, tile)
            }
        }
        // ctx.strokeStyle = 'gray'
        // ctx.strokeRect(pos.x, pos.y, size.w * scale-1, size.h * scale-1)
    })
}

function TestMapPlayer(props: { test: EditableTest, doc: EditableDocument, map: EditableMap }) {

    const ref = useRef(null)
    const [count, setCount] =  useState(0)
    useEffect(() => {
        if(ref.current) {
            drawViewport(ref.current, props.test, props.map, props.doc)
        }
    }, [count])
    return <>
        <div className={'toolbar'}>
            <button onClick={() => setCount(count+1)}>play</button>
        </div>
        <canvas ref={ref}
                width={640}
                height={480}
        >
        </canvas>
    </>
}

function TestDetails(props: { test: EditableTest, doc: EditableDocument }) {
    const {test} = props
    useObservableChange(test,Changed)
    return <div className={'pane'}>
        <header>Test Details</header>
        <ul className={'props-sheet'}>
            <li>
                <b>width</b>
                <label>{test.viewport.w}</label>
            </li>
            <li>
                <b>height</b>
                <label>{test.viewport.h}</label>
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
