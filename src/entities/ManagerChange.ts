import { log, BigInt } from '@graphprotocol/graph-ts'
import { Manager, ManagerChange, ManagerDayData } from '../../generated/schema'
import { ZERO_BD } from '../helpers/constants'
import {
  get30dOpenTime,
  get7dOpenTime,
  getDayOpenTime,
  getPrevDayOpenTime
} from '../helpers/times'
import { calcPc } from '../helpers/utils'
import { createDayDataId } from './DayData'

export function ensureManagerChanges(address: string): ManagerChange {
  let managerChange = ManagerChange.load(address) as ManagerChange
  if (managerChange == null) {
    managerChange = new ManagerChange(address)
    managerChange.manager = address
    managerChange.tvl1d = ZERO_BD
    managerChange.tvl1w = ZERO_BD
    managerChange.tvl1m = ZERO_BD
    managerChange.tvlInception = ZERO_BD
    managerChange.averagePrice1d = ZERO_BD
    managerChange.averagePrice1w = ZERO_BD
    managerChange.averagePrice1m = ZERO_BD
    managerChange.averagePriceInception = ZERO_BD
    managerChange.holders1d = 0
    managerChange.save()
  }
  return managerChange
}

export function useManagerChanges(id: string): ManagerChange {
  let managerChange = ManagerChange.load(id) as ManagerChange
  if (managerChange == null) {
    log.critical('StrategyChange {} does not exist', [id])
  }

  return managerChange
}

export function trackManagerChanges(manager: Manager, timestamp: BigInt): void {
  let managerChange = ensureManagerChanges(manager.id)

  let prevDayDataId = createDayDataId(manager.id, getPrevDayOpenTime(timestamp))
  let weekDayDatId = createDayDataId(manager.id, get7dOpenTime(timestamp))
  let monthDayDatId = createDayDataId(manager.id, get30dOpenTime(timestamp))
  let incpeptionDayDatId = createDayDataId(
    manager.id,
    getDayOpenTime(manager.createdAtTimestamp)
  )

  // 1d
  let prevDayData = ManagerDayData.load(prevDayDataId) as ManagerDayData
  if (prevDayData !== null) {
    managerChange.holders1d = manager.holdersCount - prevDayData.holdersCount

    managerChange.tvl1d = calcPc(manager.tvl, prevDayData.tvlLastTracked)
    managerChange.averagePrice1d = calcPc(
      manager.totalPrice,
      prevDayData.totalPriceLastTracked
    )
  }

  // 1w
  let prevWeekDayData = ManagerDayData.load(weekDayDatId) as ManagerDayData
  if (prevWeekDayData !== null) {
    managerChange.tvl1w = calcPc(manager.tvl, prevWeekDayData.tvlLastTracked)
    managerChange.averagePrice1w = calcPc(
      manager.totalPrice,
      prevWeekDayData.totalPriceLastTracked
    )
  }

  // 1m
  let prevMonthDayData = ManagerDayData.load(monthDayDatId) as ManagerDayData
  if (prevMonthDayData !== null) {
    managerChange.tvl1m = calcPc(manager.tvl, prevMonthDayData.tvlLastTracked)
    managerChange.averagePrice1m = calcPc(
      manager.totalPrice,
      prevMonthDayData.totalPriceLastTracked
    )
  }

  // Inception
  let inceptionDayData = ManagerDayData.load(
    incpeptionDayDatId
  ) as ManagerDayData
  if (inceptionDayData !== null) {
    managerChange.tvlInception = calcPc(
      manager.tvl,
      inceptionDayData.tvlLastTracked
    )
    managerChange.averagePriceInception = calcPc(
      manager.totalPrice,
      inceptionDayData.totalPriceLastTracked
    )
  }

  managerChange.save()
}
