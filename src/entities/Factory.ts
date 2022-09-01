import {
  Address,
  log,
  TypedMap,
  BigInt,
  json,
  BigDecimal
} from '@graphprotocol/graph-ts'
import { Platform } from '../../generated/schema'
import { getEthUsdAggregator } from '../helpers/prices'
import { strategyStates } from '../helpers/seedStrategyState'
import { strategies } from '../helpers/seedStrategies'
import { ensureEthUsdFeed } from './EthUsdFeed'

export function useFactory(): Platform {
  let factory = Platform.load('SINGLETON') as Platform

  if (factory == null) {
    log.critical('Factory does not exist', [])
  }

  return factory
}

export function isFactory(): boolean {
  let factory = Platform.load('SINGLETON') as Platform

  if (factory == null) {
    return false
  }

  return true
}

export function ensureFactory(): Platform {
  let factory = Platform.load('SINGLETON') as Platform

  if (factory) {
    return factory
  }

  let ethUsdAggregator = getEthUsdAggregator().toHexString()

  ensureEthUsdFeed(ethUsdAggregator)

  factory = new Platform('SINGLETON')

  factory.strategiesCount = 0
  factory.managersCount = 0
  factory.allManagers = []
  factory.allStrategies = []
  factory.tokens = []

  factory.save()
  log.warning('factory created', [])

  return factory
}
