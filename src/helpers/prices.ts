import { BigInt, Address, BigDecimal, log } from '@graphprotocol/graph-ts'
import { EnsoOracle as Oracle } from '../../generated/StrategyProxyFactory/EnsoOracle'
import { FeedRegistry } from '../../generated/FeedRegistry/FeedRegistry'
import { ORACLE_ADDRESS, CHAINLINK_FEED_REGISTRY } from '../addresses'
import { BASE_ETH, QUOTE_USD } from './constants'
import { useEthUsdFeed } from '../entities/EthUsdFeed'
import { removeUsdDecimals } from './tokens'

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  )
}

export function convertToUsd(assetPriceInWeth: BigDecimal): BigDecimal {
  let ethUsdFeed = useEthUsdFeed()
  let ethPriceInUsd = ethUsdFeed.latestAnswer
  return ethPriceInUsd.times(assetPriceInWeth)
}

export function getTotalEstimates(strategyAddress: Address): BigDecimal {
  let contract = Oracle.bind(Address.fromString(ORACLE_ADDRESS))

  let balanceCall = contract.try_estimateStrategy(strategyAddress)
  if (balanceCall.reverted) {
    log.critical('estimateTotal() reverted for {}', [
      strategyAddress.toHexString()
    ])
  }

  let total = balanceCall.value.value0

  let assetPrice = toBigDecimal(total)
  let totalInUsd = convertToUsd(assetPrice)

  return removeUsdDecimals(totalInUsd)
}

export function getEthUsdAggregator(): Address {
  let feedRegistry = FeedRegistry.bind(
    Address.fromString(CHAINLINK_FEED_REGISTRY)
  )
  let latestAggregator = feedRegistry.try_getFeed(BASE_ETH, QUOTE_USD)

  if (latestAggregator.reverted) {
    log.critical('getFeed() reverted for {}', [CHAINLINK_FEED_REGISTRY])
  }

  return latestAggregator.value
}

export function getLatestAnswer(): BigDecimal {
  let feedRegistry = FeedRegistry.bind(
    Address.fromString(CHAINLINK_FEED_REGISTRY)
  )
  let latestAggregator = feedRegistry.try_latestAnswer(BASE_ETH, QUOTE_USD)

  if (latestAggregator.reverted) {
    log.critical('getFeed() reverted for {}', [CHAINLINK_FEED_REGISTRY])
  }

  return latestAggregator.value.toBigDecimal()
}
