import { DialogContext, Spacer } from "josh_react_util"
import React, { useContext, useEffect, useState } from "react"

import { ListView, ListViewDirection } from "../common/ListView"
import { GlobalState } from "../state"
import { TILE_MAPPER_DOCUMENT } from "./json"
import { JSONDocReference, listLocalDocs, loadLocalDoc } from "./local"

function FileItemRenderer(props: { value: JSONDocReference | undefined }) {
  return (
    <div className={"std-list-item"}>
      <b>{props.value?.name}</b>
    </div>
  )
}
export function ListFilesDialog(props: { state: GlobalState }) {
  const { state } = props
  const dm = useContext(DialogContext)
  const [files, setFiles] = useState<JSONDocReference[]>([])
  const [selected, setSelected] = useState<JSONDocReference | undefined>()
  useEffect(() => {
    listLocalDocs(props.state).then((files) => {
      const f2 = files.filter((f) => f.kind === TILE_MAPPER_DOCUMENT)
      setFiles(f2)
    })
  }, [state])
  const cancel = () => dm.hide()
  const load = async (file: JSONDocReference) => {
    const doc = await loadLocalDoc(state, file.uuid)
    state.setPropValue("doc", doc)
    state.setSelection(doc)
    dm.hide()
  }

  return (
    <div className={"dialog"}>
      <header>Open Document</header>
      <section className={"scroll"}>
        <ListView
          key={"listview"}
          data={files}
          className={""}
          style={{}}
          options={{}}
          selected={selected}
          setSelected={setSelected}
          direction={ListViewDirection.VerticalFill}
          renderer={FileItemRenderer}
        />
      </section>
      <footer>
        <Spacer />
        <button className={"default"} onClick={() => cancel()}>
          Cancel
        </button>
        <button
          disabled={!selected}
          className={"primary"}
          onClick={() => load(selected as JSONDocReference)}
        >
          Load
        </button>
      </footer>
    </div>
  )
}
