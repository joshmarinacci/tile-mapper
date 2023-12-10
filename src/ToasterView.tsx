import "./ToasterView.css"

import { useContext, useEffect, useState } from "react"

import { StateContext } from "./model/contexts"

export function ToasterView(props: {}) {
  const state = useContext(StateContext)
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    const toaster = state.getPropValue("toaster")
    const handle = () => {
      console.log("a message happened", toaster.message)
      setVisible(true)
      setMessage(toaster.message)
      setTimeout(() => {
        setVisible(false)
      }, 1000)
    }
    toaster.on("append", handle)
    return () => {
      toaster.off("append", handle)
    }
  }, [])
  return (
    <div
      style={{
        visibility: visible ? "visible" : "hidden",
      }}
      className={"toaster-view"}
    >
      {message}
    </div>
  )
}
