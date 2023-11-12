import React from "react"

import { GlobalState } from "../state"
import { GameDoc } from "./gamedoc"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const StateContext = React.createContext<GlobalState>(null)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const DocContext = React.createContext<GameDoc>(null)
export const ActionRegistryContext = React.createContext(null)
