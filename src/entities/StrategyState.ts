import { Address, log } from '@graphprotocol/graph-ts'
import { StrategyState } from '../../generated/schema'
import { ZERO_BI } from '../helpers/constants'

export function createStrategyState(address: Address): StrategyState {
  let strategyState = new StrategyState(address.toHex())
  strategyState.slippage = ZERO_BI
  strategyState.threshold = ZERO_BI
  strategyState.timelock = ZERO_BI
  strategyState.fee = ZERO_BI
  strategyState.social = false
  strategyState.save()

  return strategyState
}

export function useStrategyState(address: Address): StrategyState {
  let strategyState = StrategyState.load(address.toHexString()) as StrategyState
  if (strategyState == null) {
    log.critical('strategyState {} does not exist', [address.toHexString()])
  }
  return strategyState
}
