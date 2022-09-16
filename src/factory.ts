import {
  NewStrategy,
  Update,
  NewOracle
} from '../generated/StrategyProxyFactory/StrategyProxyFactory'
import { Strategy as StrategyTemplate } from '../generated/templates'
import { ensureManager, getCommonItems } from './entities/Manager'
import { trackDayData } from './entities/DayData'
import { ensureFactory } from './entities/Factory'
import { createStrategy } from './entities/Strategy'
import { createItemsHolding } from './entities/StrategyItemHolding'
import { getTotalEstimates } from './helpers/prices'
import { addElement } from './helpers/utils'
import { EnsoOracle } from '../generated/schema'

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

  let strategy = createStrategy(strategyAddress, event, factory.version)
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

  StrategyTemplate.create(strategyAddress)
}

export function handleUpdate(event: Update): void {
  let newVersion = event.params.version

  let factory = ensureFactory()
  factory.version = newVersion

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
