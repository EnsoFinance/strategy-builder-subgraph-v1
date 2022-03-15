import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { StrategyTokenHoldingData } from '../../generated/schema'

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
  let holding = StrategyTokenHoldingData.load(id) as StrategyTokenHoldingData
  if (holding) {
    return
  }
  holding = new StrategyTokenHoldingData(id)
  holding.investor = investorId
  holding.strategy = strategyId
  holding.balance = balance
  holding.save()
}
