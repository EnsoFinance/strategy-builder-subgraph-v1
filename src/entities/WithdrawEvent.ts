import { log } from '@graphprotocol/graph-ts'
import { WithdrawEvent } from '../../generated/schema'
import { useStrategy } from './Strategy'
import { Withdraw } from '../../generated/StrategyController/StrategyController'

export function trackWithdrawEvent(event: Withdraw): WithdrawEvent {
  let strategyId = event.params.strategy.toHexString()
  let timestamp = event.block.timestamp
  let logIndex = event.logIndex.toString()

  let withdrawEvent = new WithdrawEvent(event.transaction.hash + logIndex)
  let strategy = useStrategy(strategyId)

  withdrawEvent.strategy = strategyId
  withdrawEvent.timestamp = timestamp
  withdrawEvent.txHash = event.transaction.hash.toHexString()
  withdrawEvent.amount = event.params.amount.toBigDecimal()

  if (event == null) {
    log.critical('Strategy {} does not exist', [id])
  }

  return event
}
