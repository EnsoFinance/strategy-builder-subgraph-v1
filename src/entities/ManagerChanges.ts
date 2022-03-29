import { log, BigInt } from '@graphprotocol/graph-ts'
import { Manager, ManagerChanges, ManagerDayData } from '../../generated/schema'
import { ZERO_BD } from '../helpers/constants'
import {
  get30dOpenTime,
  get7dOpenTime,
  getDayOpenTime,
  getPrevDayOpenTime
} from '../helpers/times'
import { calcPc } from '../helpers/utils'
import { createDayDataId } from './DayData'

export function ensureManagerChanges(address: string): ManagerChanges {
  let managerChanges = ManagerChanges.load(address) as ManagerChanges
  if (managerChanges == null) {
    managerChanges = new ManagerChanges(address)
    managerChanges.manager = address
    managerChanges.tvl1d = ZERO_BD
    managerChanges.tvl1w = ZERO_BD
    managerChanges.tvl1m = ZERO_BD
    managerChanges.averagePrice1d = ZERO_BD
    managerChanges.averagePrice1w = ZERO_BD
    managerChanges.averagePrice1m = ZERO_BD
    managerChanges.tvlInception = ZERO_BD
    managerChanges.holders1d = 0
    managerChanges.save()
  }
  return managerChanges
}

export function useManagerChanges(id: string): ManagerChanges {
  let managerChanges = ManagerChanges.load(id) as ManagerChanges
  if (managerChanges == null) {
    log.critical('StrategyChange {} does not exist', [id])
  }

  return managerChanges
}

export function trackManagerChanges(manager: Manager, timestamp: BigInt): void {
  let managerChanges = ensureManagerChanges(manager.id)

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
    managerChanges.holders1d = manager.holdersCount - prevDayData.holdersCount

    managerChanges.tvl1d = calcPc(manager.tvl, prevDayData.tvlLastTracked)
    managerChanges.averagePrice1d = calcPc(
      manager.totalPrice,
      prevDayData.totalPriceLastTracked
    )
  }

  // 1w
  let prevWeekDayData = ManagerDayData.load(weekDayDatId) as ManagerDayData
  if (prevWeekDayData !== null) {
    managerChanges.tvl1w = calcPc(manager.tvl, prevWeekDayData.tvlLastTracked)
    managerChanges.averagePrice1w = calcPc(
      manager.totalPrice,
      prevDayData.totalPriceLastTracked
    )
  }

  // 1m
  let prevMonthDayData = ManagerDayData.load(monthDayDatId) as ManagerDayData
  if (prevMonthDayData !== null) {
    managerChanges.tvl1m = calcPc(manager.tvl, prevMonthDayData.tvlLastTracked)
    managerChanges.averagePrice1m = calcPc(
      manager.totalPrice,
      prevDayData.totalPriceLastTracked
    )
  }

  // Inception
  let inceptionDayData = ManagerDayData.load(
    incpeptionDayDatId
  ) as ManagerDayData
  if (inceptionDayData !== null) {
    managerChanges.tvl1m = calcPc(manager.tvl, inceptionDayData.tvlLastTracked)
  }

  managerChanges.save()
}
