import { log, BigInt } from '@graphprotocol/graph-ts'
import {
  Strategy,
  StrategyChanges,
  StrategyDayData
} from '../../generated/schema'
import { ZERO_BD } from '../helpers/constants'
import {
  get30dOpenTime,
  get7dOpenTime,
  getDayOpenTime,
  getPrevDayOpenTime
} from '../helpers/times'
import { calcPc } from '../helpers/utils'
import { createDayDataId } from './DayData'

export function ensureStrategyChanges(address: string): StrategyChanges {
  let strategyChange = StrategyChanges.load(address) as StrategyChanges
  if (strategyChange == null) {
    strategyChange = new StrategyChanges(address)
    strategyChange.strategy = address
    strategyChange.tvl1d = ZERO_BD
    strategyChange.tvl1w = ZERO_BD
    strategyChange.tvl1m = ZERO_BD
    strategyChange.tvlInception = ZERO_BD
    strategyChange.price1d = ZERO_BD
    strategyChange.price1w = ZERO_BD
    strategyChange.price1m = ZERO_BD
    strategyChange.priceInception = ZERO_BD
    strategyChange.holders1d = 0
    strategyChange.save()
  }

  return strategyChange
}

export function useStrategyChanges(id: string): StrategyChanges {
  let strategyChange = StrategyChanges.load(id) as StrategyChanges
  if (strategyChange == null) {
    log.critical('StrategyChange {} does not exist', [id])
  }

  return strategyChange
}

export function trackStrategyChanges(
  strategy: Strategy,
  timestamp: BigInt
): void {
  let strategyChanges = ensureStrategyChanges(strategy.id)

  let prevDayDataId = createDayDataId(
    strategy.id,
    getPrevDayOpenTime(timestamp)
  )
  let weekDayDatId = createDayDataId(strategy.id, get7dOpenTime(timestamp))
  let monthDayDatId = createDayDataId(strategy.id, get30dOpenTime(timestamp))
  let incpeptionDayDatId = createDayDataId(
    strategy.id,
    getDayOpenTime(strategy.createdAtTimestamp)
  )

  //1d
  let prevDayData = StrategyDayData.load(prevDayDataId) as StrategyDayData
  if (prevDayData !== null) {
    strategyChanges.holders1d = strategy.holdersCount - prevDayData.holdersCount
    strategyChanges.tvl1d = calcPc(strategy.tvl, prevDayData.tvlLastTracked)
    strategyChanges.price1d = calcPc(
      strategy.price,
      prevDayData.priceLastTracked
    )
  }

  //1w
  let prevWeekDayData = StrategyDayData.load(weekDayDatId) as StrategyDayData
  if (prevWeekDayData !== null) {
    strategyChanges.tvl1w = calcPc(strategy.tvl, prevWeekDayData.tvlLastTracked)

    strategyChanges.price1w = calcPc(
      strategy.price,
      prevWeekDayData.priceLastTracked
    )
  }

  //1m
  let prevMonthDayData = StrategyDayData.load(monthDayDatId) as StrategyDayData
  if (prevMonthDayData !== null) {
    strategyChanges.tvl1m = calcPc(
      strategy.tvl,
      prevMonthDayData.tvlLastTracked
    )

    strategyChanges.price1m = calcPc(
      strategy.price,
      prevMonthDayData.priceLastTracked
    )
  }

  //inception
  let inceptionDayData = StrategyDayData.load(
    incpeptionDayDatId
  ) as StrategyDayData
  if (inceptionDayData !== null) {
    strategyChanges.tvl1w = calcPc(
      strategy.tvl,
      inceptionDayData.tvlLastTracked
    )

    strategyChanges.price1w = calcPc(
      strategy.price,
      inceptionDayData.priceLastTracked
    )
  }

  strategyChanges.save()
}
