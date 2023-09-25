import React from "react"

import {Actor} from "./datamodel"
import {GlobalState} from "./state"

export function ActorEditView(props: {
    actor: Actor,
    state: GlobalState
}) {
    return <div>
        editing an actor here
    </div>
}
