import { store } from '@graphprotocol/graph-ts'
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
import { trackItemsQuantitiesChange } from './entities/StrategyItemHolding'
import {
  createStrategyTokenHoldingId,
  ensureStrategyTokenHolding,
  useStrategyTokenHolding
} from './entities/StrategyTokenHoldings'
import { ZERO, ZERO_BI } from './helpers/constants'
import { toBigDecimal } from './helpers/prices'
import { ZERO_ADDRESS } from './addresses'
import { ensureClaimedPerfFees } from './entities/ClaimedPerfFee'
import { Manager } from '../generated/schema'
import { removeElement } from './helpers/utils'

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

  if (from != ZERO_ADDRESS && to != ZERO_ADDRESS) {
    let holdingFromId = createStrategyTokenHoldingId(strategy.id, from)
    let holdingFrom = useStrategyTokenHolding(holdingFromId)
    let holdingTo = ensureStrategyTokenHolding(strategy.id, to)
    let manager = useManager(strategy.manager)

    if (holdingTo.balance.equals(ZERO)) {
      manager.holdersCount = manager.holdersCount + 1
      strategy.holdersCount = strategy.holdersCount + 1
      manager.save()
      strategy.save()
    }

    holdingTo.balance = holdingTo.balance.plus(toBigDecimal(transferAmount))
    holdingFrom.balance = holdingFrom.balance.minus(
      toBigDecimal(transferAmount)
    )

    if (holdingFrom.balance.equals(ZERO)) {
      store.remove('StrategyTokenHolding', holdingFromId)
      manager.holdersCount = manager.holdersCount - 1
      strategy.holdersCount = strategy.holdersCount - 1
    }

    holdingFrom.save()
    holdingTo.save()
  }

  if (from == ZERO_ADDRESS) {
    mintStrategyTokens(strategy, transferAmount)

    let holdingTo = ensureStrategyTokenHolding(strategy.id, to)

    if (holdingTo.balance.equals(ZERO)) {
      let manager = useManager(strategy.manager)
      manager.holdersCount = manager.holdersCount + 1
      strategy.holdersCount = strategy.holdersCount + 1

      manager.save()
      strategy.save()
    }
    holdingTo.balance = holdingTo.balance.plus(toBigDecimal(transferAmount))
    holdingTo.save()
  }

  if (to == ZERO_ADDRESS) {
    burnStrategyTokens(strategy, transferAmount)

    let holdingFromId = createStrategyTokenHoldingId(strategy.id, from)
    let holdingFrom = useStrategyTokenHolding(holdingFromId)

    holdingFrom.balance = holdingFrom.balance.minus(
      toBigDecimal(transferAmount)
    )
    if (holdingFrom.balance.equals(ZERO)) {
      store.remove('StrategyTokenHolding', holdingFromId)
      let manager = useManager(strategy.manager)
      manager.holdersCount = manager.holdersCount - 1
      strategy.holdersCount = strategy.holdersCount - 1
      manager.save()
      strategy.save()
    }
    holdingFrom.save()
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
}
