import { log, Address, BigInt } from '@graphprotocol/graph-ts'
import { StateChange } from '../../generated/schema'

export function useStateChange(
  strategy: Address,
  lastStateChangeTimestamp: BigInt
): StateChange {
  let stateChangeId =
    strategy.toHexString() +
    '/stateChange/' +
    lastStateChangeTimestamp.toString()
  let stateChange = StateChange.load(stateChangeId) as StateChange
  if (stateChange == null) {
    log.critical('stateChange {} does not exist', [id])
  }
  return stateChange
}
