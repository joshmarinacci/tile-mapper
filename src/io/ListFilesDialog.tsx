import { DialogContext, Spacer } from "josh_react_util"
import React, { useContext, useEffect, useState } from "react"

import { IconButton } from "../common/common-components"
import { Icons } from "../common/icons"
import { ListView, ListViewDirection, ListViewOptions, ListViewRenderer } from "../common/ListView"
import { ImageSnapshotContext } from "../model/contexts"
import { GlobalState } from "../state"
import { IndexeddbDocumentStorage } from "./indexeddb"
import { JoshDBDocumentStorage } from "./local"
import { JSONDocReference } from "./storage"

type FileItemOptions = {
  deleteFile: (file: JSONDocReference) => Promise<void>
} & ListViewOptions

export const FileItemRenderer: ListViewRenderer<JSONDocReference, FileItemOptions> = (props: {
  value: JSONDocReference | undefined
  selected: boolean
  options: FileItemOptions
}) => {
  return (
    <div className={"std-list-item"}>
      <b>{props.value?.name}</b>
      <Spacer />
      <IconButton
        onClick={async () => {
          if (props.value) {
            await props.options.deleteFile(props.value)
          }
        }}
        icon={Icons.Trashcan}
      />
    </div>
  )
}
export function ListFilesDialog(props: { state: GlobalState }) {
  const { state } = props
  const [store] = useState(() => new IndexeddbDocumentStorage())
  // const [store] = useState(() => new JoshDBDocumentStorage())
  const dm = useContext(DialogContext)
  const [files, setFiles] = useState<JSONDocReference[]>([])
  const [selected, setSelected] = useState<JSONDocReference | undefined>()
  useEffect(() => {
    store.listLocalDocs(props.state).then((files: JSONDocReference[]) => {
      // const f2 = files.filter((f) => f.kind === TILE_MAPPER_DOCUMENT)
      setFiles(files)
    })
  }, [state])
  const cancel = () => dm.hide()
  const isc = useContext(ImageSnapshotContext)
  const load = async (file: JSONDocReference) => {
    const doc = await store.loadLocalDoc(state, file.uuid, isc)
    state.setPropValue("doc", doc)
    state.setSelection(doc)
    state.setSelectionTarget(doc)
    dm.hide()
  }
  const opts: FileItemOptions = {
    deleteFile: async (file): Promise<void> => {
      await store.deleteLocalDoc(state, file.uuid)
      const new_list = await store.listLocalDocs(state)
      setFiles(new_list)
    },
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
          options={opts}
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
