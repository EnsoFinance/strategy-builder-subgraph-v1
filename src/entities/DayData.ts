import { Address, log, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { StrategyDayData, ManagerDayData } from '../../generated/schema'
import { getTotalEstimates } from '../helpers/prices'
import { useFactory } from './Factory'
import { useStrategy } from './Strategy'
import { useManager, trackTvlChange } from './Manager'
import {
  trackTvlChange as trackStrategyTvlChange,
  trackNavChange as trackStrategyNavChange
} from './Strategy'
import { getDayOpenTime, getPreviousDayOpenTime } from '../helpers/times'
import { getTotalSupply } from '../helpers/tokens'
import { ZERO } from '../helpers/constants'

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

  //TO DO use total supply calculated from transfers
  let totalSupply = getTotalSupply(Address.fromString(strategy.id))

  let newStrategyTvl = getTotalEstimates(Address.fromString(strategyId))
  let newNav = ZERO

  if (!totalSupply.equals(ZERO)) {
    newNav = newStrategyTvl.div(totalSupply)
  }

  let manager = useManager(strategy.manager)
  manager.tvl = manager.tvl.minus(strategy.tvl).plus(newStrategyTvl)
  manager.save()

  let managerDayDataId = createDayDataId(manager.id, timestamp)
  let managerDayData = ensureManagerDayData(managerDayDataId)
  managerDayData.tvlLastTracked = manager.tvl
  managerDayData.manager = manager.id
  managerDayData.timestamp = dayOpenTime
  managerDayData.holdersCount = manager.holdersCount

  // Rexive previous day holders for diff
  let previousDayOpenTime = getPreviousDayOpenTime(dayOpenTime)
  if (previousDayOpenTime >= manager.createdAtTimestamp) {
    let managerDayDataId = createDayDataId(manager.id, previousDayOpenTime)
    let managerDayData = ManagerDayData.load(managerDayDataId) as ManagerDayData
    if (managerDayData !== null) {
      manager.holders24hDiff =
        manager.holdersCount - managerDayData.holdersCount
    }
  }

  manager.save()
  managerDayData.save()

  strategy.tvl = newStrategyTvl
  strategy.nav = newNav

  if (previousDayOpenTime >= strategy.createdAtTimestamp) {
    let strategyDayDataId = createDayDataId(strategy.id, previousDayOpenTime)
    let strategyDayData = StrategyDayData.load(
      strategyDayDataId
    ) as StrategyDayData
    if (strategyDayData !== null) {
      strategy.holders24hDiff =
        strategy.holdersCount - strategyDayData.holdersCount
    }
  }

  strategy.save()

  let strategyDayDataId = createDayDataId(strategy.id, timestamp)
  let strategyDayData = ensureStrategyDayData(strategyDayDataId)

  strategyDayData.strategy = strategy.id
  strategyDayData.timestamp = dayOpenTime
  strategyDayData.tvlLastTracked = newStrategyTvl
  strategyDayData.navLastTracked = newNav
  strategyDayData.holdersCount = strategy.holdersCount
  strategyDayData.save()

  trackStrategyTvlChange(strategy, previousDayOpenTime)
  trackStrategyNavChange(strategy, previousDayOpenTime)

  trackTvlChange(manager.id, previousDayOpenTime)
}
