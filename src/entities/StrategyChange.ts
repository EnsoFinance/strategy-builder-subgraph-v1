import { log, BigInt } from '@graphprotocol/graph-ts'
import {
  Strategy,
  StrategyChange,
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

export function ensureStrategyChange(address: string): StrategyChange {
  let strategyChange = StrategyChange.load(address) as StrategyChange
  if (strategyChange == null) {
    strategyChange = new StrategyChange(address)
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

export function useStrategyChange(id: string): StrategyChange {
  let strategyChange = StrategyChange.load(id) as StrategyChange
  if (strategyChange == null) {
    log.critical('StrategyChange {} does not exist', [id])
  }

  return strategyChange
}

export function trackStrategyChange(
  strategy: Strategy,
  timestamp: BigInt
): void {
  let strategyChange = ensureStrategyChange(strategy.id)
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
    strategyChange.holders1d = strategy.holdersCount - prevDayData.holdersCount
    strategyChange.tvl1d = calcPc(strategy.tvl, prevDayData.tvlLastTracked)
    strategyChange.price1d = calcPc(
      strategy.price,
      prevDayData.priceLastTracked
    )
  }

  //1w
  let prevWeekDayData = StrategyDayData.load(weekDayDatId) as StrategyDayData
  if (prevWeekDayData !== null) {
    strategyChange.tvl1w = calcPc(strategy.tvl, prevWeekDayData.tvlLastTracked)

    strategyChange.price1w = calcPc(
      strategy.price,
      prevWeekDayData.priceLastTracked
    )
  }

  //1m
  let prevMonthDayData = StrategyDayData.load(monthDayDatId) as StrategyDayData
  if (prevMonthDayData !== null) {
    strategyChange.tvl1m = calcPc(strategy.tvl, prevMonthDayData.tvlLastTracked)

    strategyChange.price1m = calcPc(
      strategy.price,
      prevMonthDayData.priceLastTracked
    )
  }

  //inception
  let inceptionDayData = StrategyDayData.load(
    incpeptionDayDatId
  ) as StrategyDayData
  if (inceptionDayData !== null) {
    strategyChange.tvlInception = calcPc(
      strategy.tvl,
      inceptionDayData.tvlLastTracked
    )

    strategyChange.priceInception = calcPc(
      strategy.price,
      inceptionDayData.priceLastTracked
    )
  }

  strategyChange.save()
}
