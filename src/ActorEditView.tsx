import React from "react"

import {Actor, Doc2} from "./data2"
import {GlobalState} from "./state"

export function ActorEditView(props: {
    actor: Actor,
    doc: Doc2,
    state: GlobalState
}) {
    return <div>
        editing an actor here
    </div>
}