import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { StrategyTokenHolding } from '../../generated/schema'

export function createStrategyTokenHoldingDataId(
  strategy: string,
  investor: string,
  timestamp: BigInt
): string {
  return strategy + '/' + investor + '/' + timestamp.toString()
}

export function trackStrategyTokenHoldingData(
  strategyId: string,
  investorId: string,
  timestamp: BigInt,
  balance: BigDecimal
): void {
  let id = createStrategyTokenHoldingDataId(strategyId, investorId, timestamp)
  let holding = StrategyTokenHolding.load(id) as StrategyTokenHolding
  if (holding) {
    return
  }
  holding = new StrategyTokenHolding(id)
  holding.investor = investorId
  holding.strategy = strategyId
  holding.balance = balance
  holding.save()
}
