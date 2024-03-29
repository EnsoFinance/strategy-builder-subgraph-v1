import { Address, log } from '@graphprotocol/graph-ts'
import { Platform } from '../../generated/schema'
import { getEthUsdAggregator } from '../helpers/prices'
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

export function ensureFactory(
  newImplementation: Address,
  newVersion: string
): Platform {
  let factory = Platform.load('SINGLETON') as Platform

  if (factory) {
    return factory
  }

  let ethUsdAggregator = getEthUsdAggregator().toHexString()
  ensureEthUsdFeed(ethUsdAggregator)

  factory = new Platform('SINGLETON')
  factory.address = newImplementation.toHexString()
  factory.version = newVersion
  factory.strategiesCount = 0
  factory.managersCount = 0
  factory.allManagers = []
  factory.allStrategies = []
  factory.tokens = []

  factory.save()

  return factory
}
