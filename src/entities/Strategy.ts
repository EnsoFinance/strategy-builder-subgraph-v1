import { Address, log, BigInt } from '@graphprotocol/graph-ts'
import {
  Strategy,
  StrategyDayData,
  StrategyTrends
} from '../../generated/schema'
import { useStrategyDayData, createDayDataId } from './DayData'
import { NewStrategy } from '../../generated/StrategyProxyFactory/StrategyProxyFactory'
import { useItemHolding } from './StrategyItemHolding'
import { ZERO_BD, ONE, HUNDRED } from '../helpers/constants'
import { useFactory } from './Factory'
import { createStrategyState } from './StrategyState'
import { toBigDecimal } from '../helpers/prices'
import { ensureStrategyChanges } from './StrategyChanges'

export function useStrategy(id: string): Strategy {
  let strategy = Strategy.load(id) as Strategy
  if (strategy == null) {
    log.critical('Strategy {} does not exist', [id])
  }

  return strategy
}

export function createStrategy(
  strategyAddress: Address,
  event: NewStrategy
): Strategy {
  let strategyId = strategyAddress.toHex()

  createStrategyState(strategyAddress)

  let strategy = new Strategy(strategyId)
  strategy.manager = event.params.manager.toHex()
  strategy.name = event.params.name
  strategy.state = strategyId
  strategy.symbol = event.params.symbol
  strategy.createdAtTimestamp = event.block.timestamp
  strategy.lastRestructure = event.block.timestamp
  strategy.tvl = ZERO_BD
  strategy.nav = ZERO_BD
  strategy.holdersCount = 0
  strategy.totalSupply = ZERO_BD
  strategy.createdAtBlockNumber = event.block.number

  let strategyTrends = new StrategyTrends(strategyId + '/trends')
  strategyTrends.strategy = strategyId
  strategyTrends.trend1d = ZERO_BD
  strategyTrends.trend7d = ZERO_BD
  strategyTrends.trend30d = ZERO_BD
  strategyTrends.trendAll = ZERO_BD
  strategyTrends.save()

  ensureStrategyChanges(strategyId)

  return strategy
}

export function trackTvlChange(
  strategy: Strategy,
  previousDayOpenTime: BigInt
): void {
  // track TVL since inception

  let createdAtTimestamp = strategy.createdAtTimestamp
  let strategyDayDataId = createDayDataId(strategy.id, createdAtTimestamp)
  let strategyDayData = useStrategyDayData(strategyDayDataId)
  let initialValue = strategyDayData.tvlLastTracked
  let currentValue = strategy.tvl
  let netProfit = currentValue.minus(initialValue)

  if (initialValue.equals(ZERO_BD)) {
    initialValue = ONE
  }

  let tvlChange = netProfit.div(initialValue).times(HUNDRED)
  strategy.tvlChange = tvlChange

  // track TVL 24h change
  if (previousDayOpenTime >= createdAtTimestamp) {
    let strategyDayDataId = createDayDataId(strategy.id, previousDayOpenTime)
    let strategyDayData = StrategyDayData.load(
      strategyDayDataId
    ) as StrategyDayData
    if (strategyDayData !== null) {
      let previousValue = strategyDayData.tvlLastTracked
      let netProfit = currentValue.minus(previousValue)

      if (previousValue.equals(ZERO_BD)) {
        previousValue = ONE
      }

      strategy.tvl24hChange = netProfit.div(previousValue).times(HUNDRED)
    }
  }

  strategy.save()
}

export function trackNavChange(
  strategy: Strategy,
  previousDayOpenTime: BigInt
): void {
  // track nav change since inception
  let createdAtTimestamp = strategy.createdAtTimestamp
  let strategyDayDataId = createDayDataId(strategy.id, createdAtTimestamp)
  let strategyDayData = useStrategyDayData(strategyDayDataId)
  let initialValue = strategyDayData.navLastTracked
  let currentValue = strategy.nav
  let netNav = currentValue.minus(initialValue)

  if (initialValue.equals(ZERO_BD)) {
    initialValue = ONE
  }

  strategy.navChange = netNav.div(initialValue).times(HUNDRED)

  // track nav 24h nav change
  if (previousDayOpenTime >= createdAtTimestamp) {
    let strategyDayDataId = createDayDataId(strategy.id, previousDayOpenTime)
    let strategyDayData = StrategyDayData.load(
      strategyDayDataId
    ) as StrategyDayData
    if (strategyDayData !== null) {
      let previousValue = strategyDayData.navLastTracked
      let netNav = currentValue.minus(previousValue)

      if (previousValue.equals(ZERO_BD)) {
        previousValue = ONE
      }

      strategy.nav24hChange = netNav.div(previousValue).times(HUNDRED)
    }
  }

  strategy.save()
}

export function getStrategyTokens(strategy: Strategy): Address[] {
  let itemHolding = strategy.items

  let items = itemHolding.map<string>((itemHoldingId) => {
    let itemHolding = useItemHolding(itemHoldingId)

    return itemHolding.token
  })

  return items.map<Address>((token) => Address.fromString(token))
}

export function mintStrategyTokens(
  strategy: Strategy,
  transferAmount: BigInt
): void {
  strategy.totalSupply = strategy.totalSupply.plus(toBigDecimal(transferAmount))
  strategy.save()
}

export function burnStrategyTokens(
  strategy: Strategy,
  transferAmount: BigInt
): void {
  strategy.totalSupply = strategy.totalSupply.minus(
    toBigDecimal(transferAmount)
  )
  strategy.save()
}

export function isStrategy(strategyAddress: Address): boolean {
  let factory = useFactory()

  if (factory.allStrategies.includes(strategyAddress.toHexString())) {
    return true
  }
  return false
}
