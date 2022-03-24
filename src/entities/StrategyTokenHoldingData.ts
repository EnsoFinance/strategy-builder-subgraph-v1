import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { StrategyTokenHoldingData } from '../../generated/schema'
import { Transfer } from '../../generated/templates/Strategy/Strategy'
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
  event: Transfer,
  balance: BigDecimal
): void {
  let id = createStrategyTokenHoldingDataId(
    strategyId,
    investorId,
    event.block.timestamp
  )
  let holding = StrategyTokenHoldingData.load(id) as StrategyTokenHoldingData
  if (holding) {
    return
  }
  holding = new StrategyTokenHoldingData(id)
  holding.investor = investorId
  holding.strategy = strategyId
  holding.balance = balance
  holding.timestamp = event.block.timestamp
  holding.blockNumber = event.block.number
  holding.txHash = event.transaction.hash.toHexString()
  holding.save()
}
