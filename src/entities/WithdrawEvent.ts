import { WithdrawEvent } from '../../generated/schema'
import { useStrategy } from './Strategy'
import { Withdraw } from '../../generated/StrategyController/StrategyController'

export function trackWithdrawEvent(event: Withdraw): void {
  let strategyId = event.params.strategy.toHexString()
  let strategy = useStrategy(strategyId)

  let timestamp = event.block.timestamp
  let logIndex = event.logIndex.toString()
  let amount = event.params.amount.toBigDecimal()

  let withdrawEvent = new WithdrawEvent(
    event.transaction.hash.toHexString() + logIndex.toString()
  )

  withdrawEvent.strategy = strategyId
  withdrawEvent.user = event.params.account.toHexString()
  withdrawEvent.value = strategy.price.times(amount)
  withdrawEvent.amount = amount
  withdrawEvent.timestamp = timestamp
  withdrawEvent.txHash = event.transaction.hash.toHexString()
  withdrawEvent.save()
}
