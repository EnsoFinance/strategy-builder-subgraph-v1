import { Address, store } from '@graphprotocol/graph-ts'
import {
  UpdateManagerEvent,
  UpdateStrategyEvent,
  ClaimedRewards
} from '../generated/schema'
import {
  Withdraw,
  Transfer,
  UpdateManager,
  VersionUpdated,
  RewardsClaimed,
  ManagementFee
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
  getIsInvested,
  useStrategyTokenHolding
} from './entities/StrategyTokenHoldings'
import { ZERO_BD, ZERO_BI } from './helpers/constants'
import { toBigDecimal } from './helpers/prices'
import { ZERO_ADDRESS } from './addresses'
import { removeElement } from './helpers/utils'
import { trackStrategyTokenHoldingData } from './entities/StrategyTokenHoldingData'
import { ensureClaimedPerfFees } from './entities/ClaimedPerfFee'

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

export function handleUpdateManager(event: UpdateManager): void {
  let strategy = useStrategy(event.address.toHexString())

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

export function handleVersionUpdated(event: VersionUpdated): void {
  let strategy = useStrategy(event.address.toHexString())
  strategy.version = '2'
  strategy.save()

  let updatedStretegyEvent = new UpdateStrategyEvent(strategy.id)
  updatedStretegyEvent.strategy = strategy.id
  updatedStretegyEvent.timestamp = event.block.timestamp
  updatedStretegyEvent.txHash = event.transaction.hash.toHexString()
  updatedStretegyEvent.save()
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  let strategy = useStrategy(event.address.toHexString())
  let manager = strategy.manager

  let adapter = event.params.adapter
  let tokens = event.params.tokens

  let claimedRewards = new ClaimedRewards(
    event.transaction.hash.toHex() + '/' + event.logIndex.toString()
  )
  claimedRewards.strategy = strategy.id
  claimedRewards.manager = manager
  claimedRewards.adapter = adapter
  claimedRewards.tokens = tokens
  claimedRewards.save()
}

export function handlePerformanceFee(event: ManagementFee): void {
  let strategy = useStrategy(event.address.toHexString())
  let amount = event.params.amount.toBigDecimal()

  let claimedPerfFee = ensureClaimedPerfFees(
    event.address.toHexString(),
    strategy.manager
  )
  claimedPerfFee.amount = claimedPerfFee.amount.plus(amount)
  claimedPerfFee.save()
}
