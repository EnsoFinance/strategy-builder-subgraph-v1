import { Address, log, store, Bytes } from '@graphprotocol/graph-ts'
import { UpdateManagerEvent } from '../generated/schema'
import { UpdateTradeDataCall } from '../generated/templates/Strategy/Strategy'

import {
  Withdraw,
  Transfer,
  PerformanceFee,
  UpdateManager
} from '../generated/templates/Strategy/Strategy'
import { useManager } from './entities/Manager'
import {
  burnStrategyTokens,
  mintStrategyTokens,
  useStrategy
} from './entities/Strategy'
import {
  trackItemsQuantitiesChange,
  useItemHolding
} from './entities/StrategyItemHolding'
import {
  createStrategyTokenHoldingId,
  ensureStrategyTokenHolding,
  getIsInvested,
  useStrategyTokenHolding
} from './entities/StrategyTokenHoldings'
import { ZERO_BD, ZERO_BI } from './helpers/constants'
import { toBigDecimal } from './helpers/prices'
import { ZERO_ADDRESS } from './addresses'
import { ensureClaimedPerfFees } from './entities/ClaimedPerfFee'
import { removeElement } from './helpers/utils'
import { trackStrategyTokenHoldingData } from './entities/StrategyTokenHoldingData'

export function handleWithdraw(event: Withdraw): void {
  trackItemsQuantitiesChange(event.address, event.block.timestamp)
}

export function handleTransfer(event: Transfer): void {
  if (event.params.value == ZERO_BI) {
    return
  }

  let transferAmount = event.params.value
  let from = event.params.from.toHexString()
  let to = event.params.to.toHexString()
  let strategy = useStrategy(event.address.toHexString())
  let manager = useManager(strategy.manager)
  let hasOtherStrategies = manager.strategiesCount > 1
  let isInvested = false

  // Transfer
  if (from != ZERO_ADDRESS && to != ZERO_ADDRESS) {
    let holdingFromId = createStrategyTokenHoldingId(strategy.id, from)
    let holdingFrom = useStrategyTokenHolding(holdingFromId)
    let holdingTo = ensureStrategyTokenHolding(strategy.id, to)
    let manager = useManager(strategy.manager)

    if (holdingTo.balance.equals(ZERO_BD)) {
      if (hasOtherStrategies) {
        let otherStrategies = removeElement(
          manager.strategies,
          Address.fromString(strategy.id)
        )

        isInvested = getIsInvested(otherStrategies, to)
      }

      if (!isInvested) {
        manager.holdersCount = manager.holdersCount + 1
      }
      strategy.holdersCount = strategy.holdersCount + 1
      manager.save()
      strategy.save()
    }

    holdingTo.balance = holdingTo.balance.plus(toBigDecimal(transferAmount))
    holdingFrom.balance = holdingFrom.balance.minus(
      toBigDecimal(transferAmount)
    )

    trackStrategyTokenHoldingData(strategy.id, from, event, holdingFrom.balance)
    trackStrategyTokenHoldingData(strategy.id, to, event, holdingTo.balance)

    if (holdingFrom.balance.equals(ZERO_BD)) {
      store.remove('StrategyTokenHolding', holdingFromId)
      if (hasOtherStrategies) {
        let otherStrategies = removeElement(
          manager.strategies,
          Address.fromString(strategy.id)
        )

        isInvested = getIsInvested(otherStrategies, to)
      }

      if (!isInvested) {
        manager.holdersCount = manager.holdersCount - 1
      }
      strategy.holdersCount = strategy.holdersCount - 1
    }

    holdingFrom.save()
    holdingTo.save()

    trackStrategyTokenHoldingData(strategy.id, from, event, holdingFrom.balance)
    trackStrategyTokenHoldingData(strategy.id, to, event, holdingTo.balance)
  }

  // Mint
  if (from == ZERO_ADDRESS) {
    mintStrategyTokens(strategy, transferAmount)

    let holdingTo = ensureStrategyTokenHolding(strategy.id, to)

    if (holdingTo.balance.equals(ZERO_BD)) {
      if (hasOtherStrategies) {
        let otherStrategies = removeElement(
          manager.strategies,
          Address.fromString(strategy.id)
        )

        isInvested = getIsInvested(otherStrategies, to)
      }

      if (!isInvested) {
        manager.holdersCount = manager.holdersCount + 1
      }
      strategy.holdersCount = strategy.holdersCount + 1

      manager.save()
      strategy.save()
    }
    holdingTo.balance = holdingTo.balance.plus(toBigDecimal(transferAmount))
    holdingTo.save()

    trackStrategyTokenHoldingData(strategy.id, to, event, holdingTo.balance)
  }

  // Burn
  if (to == ZERO_ADDRESS) {
    burnStrategyTokens(strategy, transferAmount)

    let holdingFromId = createStrategyTokenHoldingId(strategy.id, from)
    let holdingFrom = useStrategyTokenHolding(holdingFromId)

    holdingFrom.balance = holdingFrom.balance.minus(
      toBigDecimal(transferAmount)
    )
    if (holdingFrom.balance.equals(ZERO_BD)) {
      store.remove('StrategyTokenHolding', holdingFromId)
      let manager = useManager(strategy.manager)

      manager.holdersCount = manager.holdersCount - 1
      strategy.holdersCount = strategy.holdersCount - 1
      manager.save()
      strategy.save()
    }
    holdingFrom.save()

    trackStrategyTokenHoldingData(strategy.id, from, event, holdingFrom.balance)
  }
}

export function handlePerformanceFee(event: PerformanceFee): void {
  let amount = event.params.amount.toBigDecimal()
  let claimedPerfFee = ensureClaimedPerfFees(
    event.address.toHexString(),
    event.params.account.toHexString()
  )
  claimedPerfFee.amount = claimedPerfFee.amount.plus(amount)
  claimedPerfFee.save()
}

export function handlUpdateManager(event: UpdateManager): void {
  let strategy = useStrategy(event.transaction.from.toHexString())

  let oldManager = useManager(strategy.manager)
  oldManager.strategies = removeElement(
    oldManager.strategies,
    event.transaction.from
  )

  strategy.manager = event.params.manager.toHexString()
  strategy.save()

  let changeMangerEvent = new UpdateManagerEvent(
    event.transaction.hash.toHexString() +
      '/' +
      event.transaction.index.toString()
  )

  changeMangerEvent.strategy = strategy.id
  changeMangerEvent.oldManager = oldManager.id
  changeMangerEvent.newManager = event.params.manager.toHexString()
  changeMangerEvent.txHash = event.transaction.hash.toHexString()
  changeMangerEvent.timestamp = event.block.timestamp
  changeMangerEvent.save()
}

export function handleUpdateTradeData(call: UpdateTradeDataCall): void {
  log.warning('handleUpdateTradeData', [])
  let strategy = useStrategy(call.transaction.from.toHexString())

  let item = call.inputs.item
  let adapters = call.inputs.data.adapters as Bytes[]
  let path = call.inputs.data.path as Bytes[]
  let itemHolding = useItemHolding(item.toHexString() + strategy.id)
  itemHolding.adapters = adapters
  itemHolding.path = path
  itemHolding.save()
}
