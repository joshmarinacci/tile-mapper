// import 'prismjs/components/prism-clike'
// import 'prismjs/components/prism-javascript'
import "prismjs/themes/prism.css"

import indent from "indent.js"
import { Spacer } from "josh_react_util"
import { highlight, languages } from "prismjs"
import React from "react"
import Editor from "react-simple-code-editor"

import { GameAction } from "../model/action"
import { Actor } from "../model/actor"
import { useWatchAllProps } from "../model/base"
console.log("languages", languages.js)

export function ActionEditor(props: { actor: Actor; action: GameAction }) {
  const { actor, action } = props
  const trigger = action.getPropValue("trigger")
  const code = action.getPropValue("code")
  useWatchAllProps(action)
  const reformat = () => {
    const code = action.getPropValue("code")
    console.log("the code is", code)
    const new_code = indent.js(code, { tabString: "    " })
    console.log("new code is", new_code)
    action.setPropValue("code", new_code)
  }
  return (
    <div className={"action-card"}>
      <header>action</header>
      <div className={"hbox"}>
        <label>When Player</label>
        <b>{trigger}</b>
        <Spacer />
        <button onClick={reformat}>reformat</button>
      </div>
      <div>
        <Editor
          onValueChange={(code) => action.setPropValue("code", code)}
          highlight={(code) => highlight(code, languages.js)}
          value={code}
          padding={10}
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            border: "1px solid black",
            backgroundColor: "white",
          }}
        />
        {/*<textarea value={code}*/}
        {/*          onChange={(e) => action.setPropValue("code", e.target.value)}/>*/}
      </div>
    </div>
  )
}
