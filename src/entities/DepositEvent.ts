import { DepositEvent } from '../../generated/schema'
import { useStrategy } from './Strategy'
import { Deposit } from '../../generated/StrategyController/StrategyController'

export function trackDepositEvent(event: Deposit): void {
  let strategyId = event.params.strategy.toHexString()
  let strategy = useStrategy(strategyId)

  let timestamp = event.block.timestamp
  let logIndex = event.logIndex.toString()
  let amount = event.params.amount.toBigDecimal()

  let depositEvent = new DepositEvent(
    event.transaction.hash.toHexString() + logIndex.toString()
  )

  depositEvent.strategy = strategyId
  depositEvent.user = event.params.account.toHexString()
  depositEvent.value = strategy.price.times(amount)
  depositEvent.amount = amount
  depositEvent.timestamp = timestamp
  depositEvent.txHash = event.transaction.hash.toHexString()
  depositEvent.save()
}
