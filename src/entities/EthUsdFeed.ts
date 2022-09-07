import { Address, log } from '@graphprotocol/graph-ts'
import { EthUsdFeed } from '../../generated/schema'
import { AggregatorV3 as AggregatorV3Template } from '../../generated/templates'
import { getEthUsdAggregator, getLatestAnswer } from '../helpers/prices'

export function ensureEthUsdFeed(): EthUsdFeed {
  let latestAggregator = getEthUsdAggregator().toHexString()

  let ethUsdFeed = EthUsdFeed.load('SINGLETON') as EthUsdFeed
  if (ethUsdFeed) {
    return ethUsdFeed
  }
  ethUsdFeed = new EthUsdFeed('SINGLETON')
  ethUsdFeed.latestAggregator = latestAggregator
  ethUsdFeed.latestAnswer = getLatestAnswer()
  ethUsdFeed.save()

  AggregatorV3Template.create(Address.fromString(latestAggregator))

  return ethUsdFeed
}

export function useEthUsdFeed(): EthUsdFeed {
  let ethUsdFeed = EthUsdFeed.load('SINGLETON') as EthUsdFeed
  if (ethUsdFeed == null) {
    log.critical('ethUsdFeed {} does not exist', [])
  }

  return ethUsdFeed
}
