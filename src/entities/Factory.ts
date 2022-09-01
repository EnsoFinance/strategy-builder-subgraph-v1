import { log } from '@graphprotocol/graph-ts'
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

class TestClass {
  address: string

  constructor(address: string) {
    this.address = address
  }
}

export function seedFactory(): void {
  let traits: TestClass[] = [new TestClass('0x8asdhasiodh')]

  for (let i = 0; i < traits.length; ++i) {
    let test = new Test(traits[0].address)
    test.save()
  }
}

export function ensureFactory(): Platform {
  let factory = Platform.load('SINGLETON') as Platform

  if (factory) {
    return factory
  }
  seedFactory()

  let ethUsdAggregator = getEthUsdAggregator().toHexString()
  ensureEthUsdFeed(ethUsdAggregator)

  factory = new Platform('SINGLETON')

  factory.strategiesCount = 0
  factory.managersCount = 0
  factory.allManagers = []
  factory.allStrategies = []
  factory.tokens = []

  factory.save()

  return factory
}
