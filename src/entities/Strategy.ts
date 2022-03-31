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
  strategy.price = ZERO_BD
  strategy.holdersCount = 0
  strategy.totalSupply = ZERO_BD
  strategy.locked = false
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
