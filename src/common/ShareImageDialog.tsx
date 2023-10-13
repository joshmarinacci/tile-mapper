import {DialogContext, Spacer} from "josh_react_util"
import React, {useContext, useState} from "react"

export function ShareImageDialog(props: { blob: Blob }) {
    const [src, setSrc] = useState("")
    const dm = useContext(DialogContext)
    const dismiss = () => {
        dm.hide()
    }
    const get_url = async () => {
        const formData = new FormData()
        formData.append("file", props.blob)
        const base = "https://api.retrogami.dev/"
        const res = await fetch(`${base}sharePNG`,{
            method:'POST',
            body: formData
        })
        console.log("res =",res)
        const json = await res.json()
        console.log("json",json)
        setSrc(base+json.shareURL)
    }
    console.log("renering dialog", props.blob)
    return <div className={'dialog'}>
        <header>Share Image</header>
        <section className={'vbox'}>
            <button onClick={get_url}>get url</button>
            <img src={src}/>
            <input type={"text"} readOnly={true} value={src}/>
        </section>
        <footer>
            <Spacer/>
            <button onClick={dismiss}>dismiss</button>
        </footer>
    </div>
}
