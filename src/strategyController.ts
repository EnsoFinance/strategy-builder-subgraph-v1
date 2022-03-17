import {
  Deposit,
  Withdraw,
  Balanced,
  NewStructure,
  NewValue,
  StrategyOpen,
  StrategySet
} from '../generated/StrategyController/StrategyController'
import { NewStrategyItemsStruct } from '../generated/StrategyProxyFactory/StrategyProxyFactory'
import { Rebalance, Restructure } from '../generated/schema'
import { createItemsHolding } from './entities/StrategyItemHolding'
import { useStrategy } from './entities/Strategy'
import { convertToUsd, toBigDecimal } from './helpers/prices'
import { useRestructure } from './entities/Restructure'
import { Address } from '@graphprotocol/graph-ts'
import { trackItemsQuantitiesChange } from './entities/StrategyItemHolding'
import { getCommonItems, useManager } from './entities/Manager'
import { useStrategyState } from './entities/StrategyState'
import { TimelockCategory } from './helpers/constants'
import { trackWithdrawEvent } from './entities/WithdrawEvent'
import { trackDepositEvent } from './entities/DepositEvent'

export function handleDeposit(event: Deposit): void {
  trackItemsQuantitiesChange(event.params.strategy, event.block.timestamp)
  trackDepositEvent(event)
}

export function handleWithdraw(event: Withdraw): void {
  trackItemsQuantitiesChange(event.params.strategy, event.block.timestamp)
  trackWithdrawEvent(event)
}

export function handleRebalance(event: Balanced): void {
  let timestamp = event.block.timestamp
  let strategy = useStrategy(event.params.strategy.toHexString())

  let holdings = strategy.items
  let rebalanceId = strategy.id + '/rebalance/' + timestamp.toString()

  let rebalance = new Rebalance(rebalanceId)
  rebalance.strategy = strategy.id
  rebalance.timestamp = event.block.timestamp
  rebalance.txHash = event.transaction.hash.toHexString()
  rebalance.before = holdings

  trackItemsQuantitiesChange(event.params.strategy, event.block.timestamp)

  rebalance.after = strategy.items

  strategy.tvl = convertToUsd(toBigDecimal(event.params.totalAfter))

  strategy.save()
  rebalance.save()
}

export function handleRestructure(event: NewStructure): void {
  let txhash = event.transaction.hash
  let timestamp = event.block.timestamp
  let strategyId = event.params.strategy.toHexString()
  let newItems = event.params.items

  let strategy = useStrategy(strategyId)

  if (event.params.finalized == true) {
    let strategy = useStrategy(strategyId)

    let lastRestructure = strategy.lastRestructure
    let restructureId =
      strategy.id + '/restructure/' + lastRestructure.toString()
    let restructure = useRestructure(restructureId)
    strategy.items = restructure.after
    strategy.save()

    restructure.status = 'FINALIZED'
    restructure.txHash = txhash.toHexString()
    restructure.save()
  }

  if (event.params.finalized == false) {
    let restructureId = strategyId + '/restructure/' + timestamp.toString()

    let restructure = new Restructure(restructureId)

    let newItemsState = createItemsHolding(
      newItems as NewStrategyItemsStruct[],
      Address.fromString(strategy.id),
      timestamp
    )

    restructure.strategy = strategyId
    restructure.timestamp = timestamp
    restructure.status = 'STARTED'
    restructure.before = strategy.items
    restructure.after = newItemsState
    restructure.txHash = txhash.toHexString()

    restructure.save()

    strategy.lastRestructure = timestamp
    strategy.save()
  }
  strategy.save()

  let manager = useManager(strategy.manager)
  manager.commonItems = getCommonItems(manager)
  manager.save()
}

export function handleNewValue(event: NewValue): void {
  if (event.params.finalized == false) {
    return
  }

  let strategyState = useStrategyState(event.params.strategy)
  let newValue = event.params.newValue
  let category = event.params.category as number

  if (category == TimelockCategory.THRESHOLD) {
    strategyState.threshold = newValue
  }
  if (category == TimelockCategory.REBALANCE_SLIPPAGE) {
    strategyState.rebalanceSlippage = newValue
  }
  if (category == TimelockCategory.RESTRUCTURE_SLIPPAGE) {
    strategyState.restructureSlippage = newValue
  }
  if (category == TimelockCategory.TIMELOCK) {
    strategyState.timelock = newValue
  }
  if (category == TimelockCategory.PERFORMANCE) {
    strategyState.fee = newValue
  }
  strategyState.save()
}

export function handleStrategyOpen(event: StrategyOpen): void {
  let strategyState = useStrategyState(event.params.strategy)
  strategyState.social = true
  strategyState.save()
}

export function handleStrategySet(event: StrategySet): void {
  let strategyState = useStrategyState(event.params.strategy)
  strategyState.social = true
  strategyState.save()
}
