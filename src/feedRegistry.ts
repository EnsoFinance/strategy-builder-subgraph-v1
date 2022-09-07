import { Address } from '@graphprotocol/graph-ts'
import { FeedConfirmed } from '../generated/FeedRegistry/FeedRegistry'
import { useEthUsdFeed } from './entities/EthUsdFeed'
import { AggregatorV3 as AggregatorV3Template } from '../generated/templates'
import { BASE_ETH, QUOTE_USD } from './helpers/constants'

export function handleFeedConfirmed(event: FeedConfirmed): void {
  // We are interested only on the ETH / USD feed
  if (event.params.asset != BASE_ETH) {
    return
  }

  if (event.params.denomination != QUOTE_USD) {
    return
  }

  let latestAggregator = event.params.latestAggregator as Address

  let ethUsdFeed = useEthUsdFeed()

  if (ethUsdFeed.latestAggregator == latestAggregator.toHexString()) {
    return
  }

  ethUsdFeed.latestAggregator = latestAggregator.toHexString()
  ethUsdFeed.save()

  AggregatorV3Template.create(latestAggregator)
}
