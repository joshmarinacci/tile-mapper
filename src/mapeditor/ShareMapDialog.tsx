import { DialogContext, Spacer } from "josh_react_util"
import React, { useContext, useState } from "react"

import { DocContext } from "../model/contexts"
import { GameDoc } from "../model/gamedoc"

export function ShareMapDialog(props: { doc: GameDoc }) {
  const [src, setSrc] = useState("")
  const doc = useContext(DocContext)
  const dm = useContext(DialogContext)
  const dismiss = () => {
    dm.hide()
  }
  const get_url = async () => {
    const json_obj = doc.toJSON()
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
    // console.log("got back the response",json)
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
      </section>
      <footer>
        <Spacer />
        <button onClick={dismiss}>dismiss</button>
      </footer>
    </div>
  )
}
