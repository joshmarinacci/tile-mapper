import "./ToasterView.css"

import { useContext, useEffect, useState } from "react"

import { StateContext } from "./model/contexts"

export function ToasterView(props: {}) {
  const state = useContext(StateContext)
  const [message, setMessage] = useState("")
  useEffect(() => {
    const toaster = state.getPropValue("toaster")
    const handle = () => {
      console.log("a message happened", toaster.message)
      setMessage(toaster.message)
    }
    toaster.on("append", handle)
    return () => {
      toaster.off("append", handle)
    }
  }, [])
  return <div className={"toaster-view"}>{message}</div>
}
