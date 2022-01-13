import { log } from '@graphprotocol/graph-ts'
import { StrategyTrends } from '../../generated/schema'

export function useStrategyTrends(id: string): StrategyTrends {
  let strategyTrends = StrategyTrends.load(id) as StrategyTrends
  if (strategyTrends == null) {
    log.critical('Strategy {} does not exist', [id])
  }

  return strategyTrends
}

export function trackStrategyTrends(id: string): StrategyTrends {
  let strategyTrends = StrategyTrends.load(id) as StrategyTrends
  if (strategyTrends == null) {
    log.critical('Strategy {} does not exist', [id])
  }

  return strategyTrends
}
