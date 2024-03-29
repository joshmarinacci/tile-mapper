import { DialogContext, Spacer } from "josh_react_util"
import React, { useContext, useState } from "react"

import { docToJSON } from "../io/json"
import { get_class_registry } from "../model"
import { DocContext } from "../model/contexts"

export function ShareMapDialog() {
  const [src, setSrc] = useState("")
  const [error, setError] = useState<string | undefined>(undefined)
  const doc = useContext(DocContext)
  const dm = useContext(DialogContext)
  const dismiss = () => {
    dm.hide()
  }
  const show_preview = () => {
    window.open(src, "_blank")
  }
  const get_url = async () => {
    const json_obj = docToJSON(get_class_registry(), doc)
    // const formData = new FormData()
    // formData.append("file", props.blob)
    console.log("sharing", json_obj)
    // const base = "http://localhost:42560/"
    const base = "https://api.retrogami.dev/"
    const res = await fetch(`${base}shareJSON`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(json_obj),
    })
    const json = await res.json()
    console.log("got back the response", json)
    if (json.error) {
      console.log("got back an error")
      setError(json.error)
    }

    // const json_obj = doc.toJSON()
    // // const formData = new FormData()
    // // formData.append("file", props.blob)
    // console.log("sharing",json_obj)
    // // const base = "http://localhost:42560/"
    // const base = "https://api.retrogami.dev/"
    // const res = await fetch(`${base}shareJSON`, {
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     method: "POST",
    //     body: JSON.stringify(json_obj),
    // })
    // const json = await res.json()
    console.log("got back the response", json)
    const url = base + json.shareURL
    console.log("final url is", url)
    // // const share_url = 'https://share.retrogami.dev/public/?app=https://api.retrogami.dev/public/460351.json'
    const share_url = `https://share.retrogami.dev/public/?app=${url}`
    console.log("final share url is", share_url)
    setSrc(share_url)
  }
  return (
    <div className={"dialog"}>
      <header>Share Map</header>
      <section className={"vbox"}>
        <button onClick={get_url}>get url</button>
        <input type={"text"} readOnly={true} value={src} />
        {src && <button onClick={show_preview}>view</button>}
        {error && <div>ERROR:{error}</div>}
      </section>
      <footer>
        <Spacer />
        <button onClick={dismiss}>dismiss</button>
      </footer>
    </div>
  )
}
