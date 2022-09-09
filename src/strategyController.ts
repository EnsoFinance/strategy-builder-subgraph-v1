import { Address, Bytes } from '@graphprotocol/graph-ts'
import {
  Deposit,
  Withdraw,
  Balanced,
  NewStructure,
  NewValue,
  StrategyOpen,
  StrategySet,
  UpdateTradeData
} from '../generated/StrategyController/StrategyController'
import { NewStrategyItemsStruct } from '../generated/StrategyProxyFactory/StrategyProxyFactory'
import {
  Rebalance,
  Restructure,
  StateChange,
  UpdateTradeDataEvent
} from '../generated/schema'
import {
  createHoldingId,
  createItemsHolding,
  useItemHolding
} from './entities/StrategyItemHolding'
import { isStrategy, useStrategy } from './entities/Strategy'
import { convertToUsd, toBigDecimal } from './helpers/prices'
import { useRestructure } from './entities/Restructure'
import { trackItemsQuantitiesChange } from './entities/StrategyItemHolding'
import { getCommonItems, useManager } from './entities/Manager'
import { useStrategyState } from './entities/StrategyState'
import { timelockCategories, TimelockCategory } from './helpers/constants'
import { trackWithdrawEvent } from './entities/WithdrawEvent'
import { trackDepositEvent } from './entities/DepositEvent'
import { removeUsdDecimals } from './helpers/tokens'

export function handleDeposit(event: Deposit): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }
  trackItemsQuantitiesChange(event.params.strategy, event.block.timestamp)
  trackDepositEvent(event)
}

export function handleWithdraw(event: Withdraw): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

  trackItemsQuantitiesChange(event.params.strategy, event.block.timestamp)
  trackWithdrawEvent(event)
}

export function handleRebalance(event: Balanced): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

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

  let tvlInUsd = convertToUsd(toBigDecimal(event.params.totalAfter))
  strategy.tvl = removeUsdDecimals(tvlInUsd)

  strategy.save()
  rebalance.save()
}

export function handleRestructure(event: NewStructure): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

  let txhash = event.transaction.hash
  let timestamp = event.block.timestamp
  let strategyId = event.params.strategy.toHexString()
  let newItems = event.params.items

  let strategy = useStrategy(strategyId)
  let strategyState = useStrategyState(Address.fromString(strategyId))

  if (event.params.finalized == true) {
    let lastRestructure = strategy.lastRestructure
    let restructureId =
      strategy.id + '/restructure/' + lastRestructure.toString()
    let restructure = useRestructure(restructureId)
    strategy.items = restructure.after
    strategy.locked = false
    strategy.save()

    strategyState.locked = false
    strategyState.save()

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
    strategy.locked = true
    strategy.lastStateChange = 'RESTRUCTURE'
    strategy.save()

    strategyState.lastStateChangeTimestamp = timestamp
    strategyState.locked = true
    strategyState.lastStateChange = 'RESTRUCTURE'
    strategyState.save()
  }

  let manager = useManager(strategy.manager)
  manager.commonItems = getCommonItems(manager)
  manager.save()
}

export function handleNewValue(event: NewValue): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

  let category = event.params.category as number

  if (event.params.finalized == false) {
    let strategy = useStrategy(event.params.strategy.toHexString())
    strategy.lastRestructure = event.block.timestamp
    strategy.lastStateChange = timelockCategories[category as u8]
    strategy.locked = true
    strategy.save()

    let strategyState = useStrategyState(event.params.strategy)
    strategyState.lastStateChangeTimestamp = event.block.timestamp
    strategyState.lastStateChange = timelockCategories[category as u8]
    strategyState.locked = true
    strategyState.save()

    let stateChangeId =
      event.params.strategy.toHexString() +
      '/stateChange/' +
      event.block.timestamp.toString()
    let stateChange = new StateChange(stateChangeId)
    stateChange.strategyState = strategyState.id

    stateChange.stateChangeCategory = timelockCategories[category as u8]

    if (category == TimelockCategory.REBALANCE_SLIPPAGE) {
      stateChange.before = strategyState.rebalanceSlippage
    }
    if (category == TimelockCategory.THRESHOLD) {
      stateChange.before = strategyState.threshold
    }
    if (category == TimelockCategory.RESTRUCTURE_SLIPPAGE) {
      stateChange.before = strategyState.restructureSlippage
    }
    if (category == TimelockCategory.TIMELOCK) {
      stateChange.before = strategyState.timelock
    }
    if (category == TimelockCategory.PERFORMANCE) {
      stateChange.before = strategyState.fee
    }

    stateChange.after = event.params.newValue
    stateChange.status = 'STARTED'
    stateChange.timestamp = event.block.timestamp
    stateChange.txHash = event.transaction.hash.toHexString()
    stateChange.blockNumber = event.block.number
    stateChange.save()

    return
  }

  let strategyState = useStrategyState(event.params.strategy)
  let newValue = event.params.newValue

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

  let strategy = useStrategy(event.params.strategy.toHexString())
  strategy.locked = false
  strategy.save()

  strategyState.locked = false
  strategyState.save()

  let stateChangeId =
    event.params.strategy.toHexString() +
    '/stateChange/' +
    strategyState.lastStateChangeTimestamp.toString()
  let stateChange = StateChange.load(stateChangeId)
  if (stateChange != null) {
    stateChange.status = 'FINALIZED'
    stateChange.save()
  }
}

export function handleStrategyOpen(event: StrategyOpen): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

  let strategyState = useStrategyState(event.params.strategy)
  strategyState.social = true
  strategyState.save()
}

export function handleStrategySet(event: StrategySet): void {
  if (!isStrategy(event.params.strategy)) {
    return
  }

  let strategyState = useStrategyState(event.params.strategy)
  strategyState.social = true
  strategyState.save()
}

export function handleUpdateTradeData(event: UpdateTradeData): void {
  if (event.params.finalized == false) {
    let strategy = useStrategy(event.params.strategy.toHexString())
    strategy.lastStateChange = 'TRADE_DATA'
    strategy.locked = true
    strategy.save()

    let strategyState = useStrategyState(event.params.strategy)
    strategyState.lastStateChangeTimestamp = event.block.timestamp
    strategyState.lastStateChange = 'TRADE_DATA'
    strategyState.locked = true
    strategyState.save()
  }

  if (event.params.finalized == true) {
    let strategyId = event.params.strategy.toHexString()
    let strategy = useStrategy(strategyId)
    strategy.locked = false
    strategy.save()

    let strategyState = useStrategyState(event.params.strategy)
    strategyState.locked = false
    strategyState.save()

    let item = event.params.item
    let adapters = event.params.data.adapters as Bytes[]
    let path = event.params.data.path as Bytes[]

    let itemHoldingId = createHoldingId(
      strategyId,
      item.toHexString(),
      strategy.lastRestructure
    )
    let itemHolding = useItemHolding(itemHoldingId)
    itemHolding.adapters = adapters
    itemHolding.path = path
    itemHolding.save()

    let updateTradeDataEvent = new UpdateTradeDataEvent(
      event.transaction.hash.toHexString() +
        '/' +
        event.transaction.index.toString()
    )
    updateTradeDataEvent.strategy = strategyId
    updateTradeDataEvent.item = item.toHexString()
    updateTradeDataEvent.newAdapters = adapters
    updateTradeDataEvent.newPath = path
    updateTradeDataEvent.timestamp = event.block.timestamp
    updateTradeDataEvent.txHash = event.transaction.hash.toHexString()
    updateTradeDataEvent.save()
  }
}
