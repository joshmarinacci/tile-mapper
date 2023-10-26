import React from "react"

import { GlobalState } from "../state"
import { ActionRegistry } from "./base"
import { GameDoc } from "./datamodel"

export const StateContext = React.createContext<GlobalState>(null)
export const DocContext = React.createContext<GameDoc>(null)
const AR = new ActionRegistry()
export const ActionRegistryContext = React.createContext(AR)
