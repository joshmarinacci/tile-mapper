import {DialogContext} from "josh_react_util"
import {useContext} from "react"

import {ReactMenuAction} from "./common-components"
import {NewDocDialog} from "./NewDocDialog"
import {GlobalState} from "./state"


function NewDocButton(props:{state:GlobalState}) {
    const dm = useContext(DialogContext)
    const show = () => {
        dm.show(<NewDocDialog onComplete={(doc)=>{
            props.state.setPropValue('doc',doc)
        }}/>)
    }
    return <button onClick={show}>New</button>
}
export const NewDocAction:ReactMenuAction = {
    type:'react',
    title:'new',
    makeComponent: (state) => {
        return <NewDocButton state={state}/>
    }
}
