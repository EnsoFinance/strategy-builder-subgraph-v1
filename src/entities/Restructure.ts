import { log } from '@graphprotocol/graph-ts'
import { Restructure } from '../../generated/schema'

export function useRestructure(id: string): Restructure {
  let restructureEvent = Restructure.load(id) as Restructure
  if (restructureEvent == null) {
    log.critical('Restructure Event {} does not exist', [id])
  }

  return restructureEvent
}
