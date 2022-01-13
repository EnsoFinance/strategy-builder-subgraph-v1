import { log } from '@graphprotocol/graph-ts'
import { StrategyTokenHolding } from '../../generated/schema'
import { ZERO } from '../helpers/constants'

export function createStrategyTokenHoldingId(strategy: string, investor: string): string {
  return strategy + '/' + investor
}

export function useStrategyTokenHolding(id: string): StrategyTokenHolding {
  let holding = StrategyTokenHolding.load(id) as StrategyTokenHolding
  if (holding == null) {
    log.critical('StrategyTokenHolding {} does not exist', [id])
  }

  return holding
}

export function ensureStrategyTokenHolding(strategyId: string, investorId: string): StrategyTokenHolding {
  let id = createStrategyTokenHoldingId(strategyId, investorId)
  let holding = StrategyTokenHolding.load(id) as StrategyTokenHolding
  if (holding) {
    return holding
  }
  holding = new StrategyTokenHolding(id)
  holding.investor = investorId
  holding.strategy = strategyId
  holding.balance = ZERO

  return holding
}
