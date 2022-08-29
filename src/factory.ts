import {
  NewStrategy,
  Update,
  NewOracle
} from '../generated/StrategyProxyFactory/StrategyProxyFactory'
import {
  Strategy as StrategyTemplate,
  StrategyProxyFactory as StrategyProxyFactoryTemplate
} from '../generated/templates'
import { ensureManager, getCommonItems } from './entities/Manager'
import { trackAllDayData, trackDayData } from './entities/DayData'
import { ensureFactory, useFactory } from './entities/Factory'
import { createStrategy } from './entities/Strategy'
import { createItemsHolding } from './entities/StrategyItemHolding'
import { getTotalEstimates } from './helpers/prices'
import { addElement } from './helpers/utils'
import { EnsoOracle } from '../generated/schema'
import { BigDecimal, log } from '@graphprotocol/graph-ts'

export function handleNewStrategy(event: NewStrategy): void {
  let factory = ensureFactory()

  let timestamp = event.block.timestamp
  let managerAddress = event.params.manager
  let strategyAddress = event.params.strategy

  factory.strategiesCount = factory.strategiesCount + 1
  factory.allStrategies = addElement(factory.allStrategies, strategyAddress)
  if (!factory.allManagers.includes(managerAddress.toHexString())) {
    factory.allManagers = addElement(factory.allManagers, managerAddress)
    factory.managersCount = factory.managersCount + 1
  }

  factory.save()

  let items = event.params.items
  let strategyItems = createItemsHolding(items, strategyAddress, timestamp)

  let strategyTvl = getTotalEstimates(strategyAddress)

  let strategy = createStrategy(strategyAddress, event)
  strategy.items = strategyItems
  strategy.tvl = strategyTvl
  strategy.save()

  let manager = ensureManager(managerAddress, timestamp)
  manager.tvl = manager.tvl.plus(strategyTvl)
  manager.strategies = addElement(manager.strategies, strategyAddress)
  manager.strategiesCount = manager.strategiesCount + 1
  manager.save()

  manager.commonItems = getCommonItems(manager)
  manager.save()

  trackDayData(strategy.id, timestamp)
  trackAllDayData(timestamp)

  StrategyTemplate.create(strategyAddress)
}

export function handleUpdate(event: Update): void {
  let newImplementation = event.params.newImplementation
  let newVersion = event.params.version

  let factory = ensureFactory()

  StrategyProxyFactoryTemplate.create(newImplementation)

  factory.save()
}

export function handleNewOracle(event: NewOracle): void {
  let oracle = EnsoOracle.load('SINGLETON') as EnsoOracle

  if (oracle == null) {
    oracle = new EnsoOracle('SINGLETON')
    oracle.address = event.params.newOracle.toHexString()
    oracle.save()

    return
  }

  oracle.address = event.params.newOracle.toHexString()
  oracle.save()
}
