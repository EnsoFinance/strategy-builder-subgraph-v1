import { Address, log } from '@graphprotocol/graph-ts'
import { Strategy } from '../../generated/templates/Strategy/Strategy'

export function getAdapters(
  strategyAddress: Address,
  item: Address
): Address[] {
  let contract = Strategy.bind(strategyAddress)

  let tradeDataCall = contract.try_getTradeData(item)
  if (tradeDataCall.reverted) {
    log.critical("Couldn't get trade data for item {} on strategy {}", [
      strategyAddress.toHexString(),
      item.toHexString()
    ])
  }
  return tradeDataCall.value.adapters
}
