import { Address, log, BigInt } from '@graphprotocol/graph-ts'
import { Strategy } from '../../generated/schema'
import { NewStrategy } from '../../generated/StrategyProxyFactory/StrategyProxyFactory'
import { useItemHolding } from './StrategyItemHolding'
import { ZERO_BD } from '../helpers/constants'
import { ensureFactory } from './Factory'
import { createStrategyState } from './StrategyState'
import { toBigDecimal } from '../helpers/prices'
import { ensureStrategyChange } from './StrategyChange'
import { useEnsoOracle } from './EnsoOracle'

export function useStrategy(id: string): Strategy {
  let strategy = Strategy.load(id) as Strategy
  if (strategy == null) {
    log.critical('Strategy {} does not exist', [id])
  }

  return strategy
}

export function createStrategy(
  strategyAddress: Address,
  event: NewStrategy,
  version: string
): Strategy {
  let strategyId = strategyAddress.toHex()

  createStrategyState(strategyAddress, event.block.timestamp)

  let ensoOracle = useEnsoOracle()

  let strategy = new Strategy(strategyId)
  strategy.manager = event.params.manager.toHex()
  strategy.name = event.params.name
  strategy.state = strategyId
  strategy.symbol = event.params.symbol
  strategy.version = version
  strategy.createdAtTimestamp = event.block.timestamp
  strategy.lastRestructure = event.block.timestamp
  strategy.locked = false
  strategy.tvl = ZERO_BD
  strategy.price = ZERO_BD
  strategy.holdersCount = 0
  strategy.totalSupply = ZERO_BD
  strategy.createdAtBlockNumber = event.block.number

  ensureStrategyChange(strategyId)

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
  let factory = ensureFactory()

  if (factory.allStrategies.includes(strategyAddress.toHexString())) {
    return true
  }
  return false
}
