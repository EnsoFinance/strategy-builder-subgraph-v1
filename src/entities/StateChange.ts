import { log } from '@graphprotocol/graph-ts'
import { StateChange } from '../../generated/schema'

export function useStateChange(id: string): StateChange {
  let stateChange = StateChange.load(id) as StateChange
  if (stateChange == null) {
    log.critical('stateChange {} does not exist', [id])
  }
  return stateChange
}
