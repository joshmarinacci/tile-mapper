import {DialogContext} from "josh_react_util"
import {useContext} from "react"

import {ReactMenuAction} from "./common-components"
import {ListFilesDialog} from "./io/ListFilesDialog"
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
function LoadDocButton(props: { state: GlobalState }): JSX.Element {
    const dm = useContext(DialogContext)
    const showOpenDialog = () => dm.show(<ListFilesDialog state={props.state}/>)
    return <button onClick={showOpenDialog}> Open</button>
}

export const LoadLocalStorageAction:ReactMenuAction = {
    type:"react",
    title: 'open doc',
    makeComponent: (state) => {
        return <LoadDocButton state={state}/>
    }
}
