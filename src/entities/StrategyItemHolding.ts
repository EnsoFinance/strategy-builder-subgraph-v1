import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { StrategyItemHolding } from '../../generated/schema'
import { NewStrategyItemsStruct } from '../../generated/StrategyProxyFactory/StrategyProxyFactory'
import { trackDayData } from './DayData'
import { ensureToken } from './Tokens'
import { getTokenBalance } from '../helpers/tokens'
import { isStrategy, useStrategy } from './Strategy'

export function createHoldingId(token: string, strategy: string, timestamp: BigInt): string {
  return strategy + '/' + timestamp.toString() + '/itemHolding/' + token
}

export function useItemHolding(id: string): StrategyItemHolding {
  let itemHolding = StrategyItemHolding.load(id) as StrategyItemHolding
  if (itemHolding == null) {
    log.critical('StrategyItemHolding {} does not exist', [id])
  }

  return itemHolding
}

export function trackStrategyItems(items: string[], strategy: Address): void {
  for (let i = 0; i < items.length; ++i) {
    let itemHolding = useItemHolding(items[i])
    let tokenAddress = Address.fromString(itemHolding.token)

    let newBalance = getTokenBalance(tokenAddress, strategy)
    itemHolding.balance = newBalance

    itemHolding.save()
  }
}

export function trackItemsQuantitiesChange(strategyAddress: Address, timestamp: BigInt): void {
  let strategy = useStrategy(strategyAddress.toHexString())

  trackStrategyItems(strategy.items, strategyAddress)
  trackDayData(strategy.id, timestamp)
}

export function createRebalancedItemsHolding(items: string[], strategy: Address, timestamp: BigInt): string[] {
  let newItems: string[] = new Array<string>()

  for (let i = 0; i < items.length; ++i) {
    let itemHolding = useItemHolding(items[i])
    let tokenAddress = Address.fromString(itemHolding.token)

    let newItemHolding = createItem(tokenAddress, itemHolding.percentage, strategy.toHexString(), timestamp)

    newItems.push(newItemHolding.id)
  }
  return newItems
}

export function createItemsHolding(
  items: NewStrategyItemsStruct[],
  strategyAddress: Address,
  timestamp: BigInt
): string[] {
  let strategyItems: string[] = new Array<string>()

  for (let i = 0; i < items.length; ++i) {
    let strategyItem = createItem(items[i].item, items[i].percentage, strategyAddress.toHexString(), timestamp)
    strategyItems.push(strategyItem.id)
  }
  return strategyItems
}

export function createItem(
  itemAddress: Address,
  percentage: BigInt,
  strategyId: string,
  timestamp: BigInt
): StrategyItemHolding {
  let item = ensureToken(itemAddress)
  let newBalance = getTokenBalance(itemAddress, Address.fromString(strategyId))

  let newItemHolding = new StrategyItemHolding(createHoldingId(item.id, strategyId, timestamp))

  if (isStrategy(itemAddress)) {
    newItemHolding.strategy = item.id
  }
  newItemHolding.token = item.id
  newItemHolding.balance = newBalance
  newItemHolding.percentage = percentage
  newItemHolding.timestamp = timestamp
  newItemHolding.save()

  return newItemHolding
}
