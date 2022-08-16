import { Address, log, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { StrategyDayData, ManagerDayData } from '../../generated/schema'
import { getTotalEstimates } from '../helpers/prices'
import { useFactory } from './Factory'
import { useStrategy } from './Strategy'
import { trackStrategyChange } from './StrategyChange'
import { useManager } from './Manager'
import { getDayOpenTime } from '../helpers/times'
import { ZERO_BD } from '../helpers/constants'
import { trackManagerChanges } from './ManagerChange'

export function createDayDataId(identifier: string, timestamp: BigInt): string {
  let dayStartTimestamp = getDayOpenTime(timestamp)
  return identifier + '/' + dayStartTimestamp.toString()
}

export function useStrategyDayData(id: string): StrategyDayData {
  let strategyDayData = StrategyDayData.load(id) as StrategyDayData
  if (strategyDayData == null) {
    log.critical('Strategy Day Data {} does not exist', [id])
  }

  return strategyDayData
}

export function useManagerDayData(id: string): ManagerDayData {
  let managerDayData = ManagerDayData.load(id) as ManagerDayData
  if (managerDayData == null) {
    log.critical('Manager {} does not exist', [id])
  }

  return managerDayData
}

export function ensureStrategyDayData(dayDataId: string): StrategyDayData {
  let dayData = StrategyDayData.load(dayDataId)

  if (dayData == null) {
    dayData = new StrategyDayData(dayDataId)
  }
  return dayData as StrategyDayData
}

export function ensureManagerDayData(dayDataId: string): ManagerDayData {
  let dayData = ManagerDayData.load(dayDataId)

  if (dayData == null) {
    dayData = new ManagerDayData(dayDataId)
  }
  return dayData as ManagerDayData
}

export function trackAllDayData(timestamp: BigInt): void {
  let factory = useFactory()
  let strategies = factory.allStrategies

  for (let i = 0; i < strategies.length; ++i) {
    trackDayData(strategies[i], timestamp)
  }
}

export function trackDayData(strategyId: string, timestamp: BigInt): void {
  let strategy = useStrategy(strategyId)
  let dayOpenTime = getDayOpenTime(timestamp)

  // Update strategy and manager to latest values
  let totalSupply = strategy.totalSupply
  let latestTvl = getTotalEstimates(Address.fromString(strategyId))

  let latestPrice = ZERO_BD

  if (!totalSupply.equals(ZERO_BD)) {
    latestPrice = latestTvl.div(totalSupply)
  }

  let manager = useManager(strategy.manager)
  manager.tvl = manager.tvl.minus(strategy.tvl).plus(latestTvl)
  manager.totalPrice = manager.totalPrice
    .minus(strategy.price)
    .plus(latestPrice)
  manager.strategiesAveragePrice = manager.totalPrice.div(
    BigDecimal.fromString(BigInt.fromI32(manager.strategiesCount).toString())
  )
  manager.save()

  strategy.totalSupply = totalSupply
  strategy.tvl = latestTvl
  strategy.price = latestPrice
  strategy.save()

  // Track strategy and manager day data
  let managerDayDataId = createDayDataId(manager.id, timestamp)
  let managerDayData = ensureManagerDayData(managerDayDataId)
  managerDayData.tvlLastTracked = manager.tvl
  managerDayData.manager = manager.id
  managerDayData.timestamp = dayOpenTime
  managerDayData.totalPriceLastTracked = manager.totalPrice
  managerDayData.holdersCount = manager.holdersCount

  manager.save()
  managerDayData.save()

  strategy.save()

  let strategyDayDataId = createDayDataId(strategy.id, timestamp)
  let strategyDayData = ensureStrategyDayData(strategyDayDataId)

  strategyDayData.strategy = strategy.id
  strategyDayData.timestamp = dayOpenTime
  strategyDayData.tvlLastTracked = latestTvl
  strategyDayData.priceLastTracked = latestPrice
  strategyDayData.holdersCount = strategy.holdersCount
  strategyDayData.save()

  trackStrategyChange(strategy, timestamp)
  trackManagerChanges(manager, timestamp)
}
