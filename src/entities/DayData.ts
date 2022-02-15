import { Address, log, BigInt } from '@graphprotocol/graph-ts'
import { StrategyDayData, ManagerDayData } from '../../generated/schema'
import { getTotalEstimates } from '../helpers/prices'
import { useFactory } from './Factory'
import { useStrategy } from './Strategy'
import { trackStrategyChanges } from './StrategyChanges'
import { useManager } from './Manager'
import { getDayOpenTime } from '../helpers/times'
import { getTotalSupply } from '../helpers/tokens'
import { ZERO_BD } from '../helpers/constants'
import { trackManagerChanges } from './ManagerChanges'

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
  let totalSupply = getTotalSupply(Address.fromString(strategy.id)) //TO DO use total supply calculated from transfers

  let latestTvl = getTotalEstimates(Address.fromString(strategyId))
  let latestNav = ZERO_BD

  if (!totalSupply.equals(ZERO_BD)) {
    latestNav = latestTvl.div(totalSupply)
  }

  let manager = useManager(strategy.manager)
  manager.tvl = manager.tvl.minus(strategy.tvl).plus(latestTvl)
  manager.save()

  strategy.totalSupply = totalSupply
  strategy.tvl = latestTvl
  strategy.nav = latestNav
  strategy.save()

  // Track strategy and manager day data
  let managerDayDataId = createDayDataId(manager.id, timestamp)
  let managerDayData = ensureManagerDayData(managerDayDataId)
  managerDayData.tvlLastTracked = manager.tvl
  managerDayData.manager = manager.id
  managerDayData.timestamp = dayOpenTime
  managerDayData.holdersCount = manager.holdersCount

  manager.save()
  managerDayData.save()

  strategy.save()

  let strategyDayDataId = createDayDataId(strategy.id, timestamp)
  let strategyDayData = ensureStrategyDayData(strategyDayDataId)

  strategyDayData.strategy = strategy.id
  strategyDayData.timestamp = dayOpenTime
  strategyDayData.tvlLastTracked = latestTvl
  strategyDayData.navLastTracked = latestNav
  strategyDayData.holdersCount = strategy.holdersCount
  strategyDayData.save()

  trackStrategyChanges(strategy, timestamp)
  trackManagerChanges(manager, timestamp)
}
