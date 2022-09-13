import { log } from '@graphprotocol/graph-ts'
import { Platform } from '../../generated/schema'
import { seedStrategyStates } from '../helpers/seedStrategyState'
import { seedStrategies } from '../helpers/seedStrategies'
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

  log.warning('Creating factory', [])
  ensureEthUsdFeed()

  factory = new Platform('SINGLETON')
  factory.version = '1'
  factory.strategiesCount = 0
  factory.managersCount = 0
  factory.allManagers = []
  factory.allStrategies = []
  factory.save()

  seedStrategyStates()
  factory = seedStrategies(factory)
  factory.save()

  return factory
}
