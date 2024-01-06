import { UUID } from "../model/base"
import { GameDoc } from "../model/gamedoc"
import { ImageSnapshotCache } from "../model/ImageSnapshotCache"
import { GlobalState } from "../state"

export type JSONDocReference = {
  uuid: string
  name: string
  // kind: string
  // thumbnail?: string
  // creationDate: Date
  // updateDate: Date
}

export interface DocumentStorage {
  listLocalDocs(state: GlobalState): Promise<JSONDocReference[]>
  saveLocalDoc(state: GlobalState): Promise<void>
  loadLocalDoc(state: GlobalState, uuid: UUID, isc: ImageSnapshotCache): Promise<GameDoc>
  deleteLocalDoc(state: GlobalState, uuid: UUID): Promise<void>
}
