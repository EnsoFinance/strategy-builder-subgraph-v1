import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { Manager, ManagerDayData, ManagerTrends } from '../../generated/schema'
import { createDayDataId, useManagerDayData } from './DayData'
import { ZERO, ONE, HUNDRED, THOUSAND } from '../helpers/constants'
import { arrayUnique } from '../helpers/utils'
import { useStrategy, getStrategyTokens, isStrategy } from './Strategy'
import { ensureCommonItem } from './CommonItem'

export function useManager(id: string): Manager {
  let manager = Manager.load(id) as Manager
  if (manager == null) {
    log.critical('Manager {} does not exist', [id])
  }

  return manager
}

export function ensureManagerTrend(id: string): void {
  let managerTrends = ManagerTrends.load(id) as ManagerTrends
  if (managerTrends) {
    return
  }
  managerTrends = new ManagerTrends(id + '/trends')
  managerTrends.manager = id
  managerTrends.trend1d = ZERO
  managerTrends.trend7d = ZERO
  managerTrends.trend30d = ZERO
  managerTrends.trendAll = ZERO
  managerTrends.save()
}

export function ensureManager(address: Address, timestamp: BigInt): Manager {
  let manager = Manager.load(address.toHex()) as Manager
  if (manager) {
    return manager
  }

  manager = new Manager(address.toHex())
  manager.strategiesCount = 0
  manager.strategies = []
  manager.createdAtTimestamp = timestamp
  manager.tvlChange = ZERO
  manager.tvl24hChange = ZERO
  manager.holdersCount = 0
  manager.holders24hDiff = 0
  manager.tvl = ZERO
  manager.commonItems = []

  return manager
}

export function trackTvlChange(
  managerId: string,
  previousDayOpenTime: BigInt
): void {
  let manager = useManager(managerId)

  let creationTimestamp = manager.createdAtTimestamp
  let managerDayDataId = createDayDataId(manager.id, creationTimestamp)
  let managerDayData = useManagerDayData(managerDayDataId)
  let initialValue = managerDayData.tvlLastTracked
  let currentValue = manager.tvl
  let netTvl = currentValue.minus(initialValue)

  if (initialValue.equals(ZERO)) {
    initialValue = ONE
  }

  let tvlChange = netTvl.div(initialValue).times(HUNDRED)
  manager.tvlChange = tvlChange

  // track TVL 24h change
  if (previousDayOpenTime >= creationTimestamp) {
    let managerDayDataId = createDayDataId(manager.id, previousDayOpenTime)
    let managerDayData = ManagerDayData.load(managerDayDataId) as ManagerDayData
    if (managerDayData !== null) {
      let previousValue = managerDayData.tvlLastTracked
      let net = currentValue.minus(previousValue)

      if (previousValue.equals(ZERO)) {
        previousValue = ONE
      }

      manager.tvl24hChange = net.div(previousValue).times(HUNDRED)
    }
  }

  manager.save()
}

export function getCommonItems(manager: Manager): string[] {
  let commonItems: Array<string> = []
  let managerItems: Array<Address> = []

  // Get all manager items, with duplicates
  for (let i = 0; i < manager.strategies.length; ++i) {
    let strategies = manager.strategies
    let strategy = useStrategy(strategies[i])
    let tokens = getStrategyTokens(strategy)
    managerItems = managerItems.concat(tokens)
  }

  let uniqueItems = arrayUnique<Address>(managerItems)

  // Check items number to calculate percentage
  for (let i = 0; i < uniqueItems.length; ++i) {
    let currItem = uniqueItems[i]

    let numItems = ZERO

    for (let i = 0; i < managerItems.length; ++i) {
      if (currItem.equals(managerItems[i])) {
        numItems = numItems.plus(ONE)
      }
    }

    let totalItems = new BigDecimal(BigInt.fromI32(managerItems.length))

    let item = ensureCommonItem(currItem.toHexString(), manager.id)

    item.token = currItem.toHexString()

    if (isStrategy(currItem)) {
      item.strategy = currItem.toHexString()
    }
    item.percentage = numItems.times(THOUSAND).div(totalItems)
    item.save()
    commonItems.push(item.id)
  }
  return commonItems
}
