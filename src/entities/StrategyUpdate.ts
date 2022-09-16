import { Address, log } from '@graphprotocol/graph-ts'
import { StrategyUpdate } from '../../generated/schema'

export function ensureStrategyUpdate(address: Address): StrategyUpdate {
  let strategyUpdate = StrategyUpdate.load(
    address.toHexString()
  ) as StrategyUpdate
  if (strategyUpdate) {
    return strategyUpdate
  }

  strategyUpdate = new StrategyUpdate(address.toHex())
  strategyUpdate.strategy = address.toHex()
  strategyUpdate.implementation = false
  strategyUpdate.adapters = false
  strategyUpdate.rewards = false
  strategyUpdate.save()

  return strategyUpdate
}

export function useToken(address: Address): Token {
  let token = Token.load(address.toHexString()) as Token
  if (token == null) {
    log.critical('Token {} does not exist', [address.toHexString()])
  }
  return token
}
