import { log } from '@graphprotocol/graph-ts'
import { StrategyTokenHolding } from '../../generated/schema'
import { ZERO_BD } from '../helpers/constants'

export function createStrategyTokenHoldingId(
  strategy: string,
  investor: string
): string {
  return strategy + '/' + investor
}

export function useStrategyTokenHolding(id: string): StrategyTokenHolding {
  let holding = StrategyTokenHolding.load(id) as StrategyTokenHolding
  if (holding == null) {
    log.critical('StrategyTokenHolding {} does not exist', [id])
  }

  return holding
}

export function ensureStrategyTokenHolding(
  strategyId: string,
  investorId: string
): StrategyTokenHolding {
  let id = createStrategyTokenHoldingId(strategyId, investorId)
  let holding = StrategyTokenHolding.load(id) as StrategyTokenHolding
  if (holding) {
    return holding
  }
  holding = new StrategyTokenHolding(id)
  holding.investor = investorId
  holding.strategy = strategyId
  holding.balance = ZERO_BD

  return holding
}

export function getIsInvested(
  strategies: Array<string>,
  investor: string
): boolean {
  for (let i = 0; i < strategies.length; ++i) {
    let strategyTokenHolding = StrategyTokenHolding.load(
      strategies[i] + investor
    ) as StrategyTokenHolding
    if (!strategyTokenHolding == null) {
      return true
    }
  }

  return false
}
