import { Address, log, BigInt } from '@graphprotocol/graph-ts'
import {
  Strategy as StrategyContract,
  Strategy__getTradeDataResultValue0Struct
} from '../../generated/templates/Strategy/Strategy'

export function getStrategyItems(strategyAddress: Address): Address[] {
  let contract = StrategyContract.bind(strategyAddress)

  let balanceCall = contract.try_items()
  if (balanceCall.reverted) {
    log.critical('getStrategyItems() reverted for {}', [
      strategyAddress.toHexString()
    ])
  }

  let items = balanceCall.value

  return items
}

export function getTradeData(
  strategyAddress: Address,
  item: Address
): Strategy__getTradeDataResultValue0Struct {
  let contract = StrategyContract.bind(strategyAddress)

  let balanceCall = contract.try_getTradeData(item)
  if (balanceCall.reverted) {
    log.critical('getTradeData() reverted for {}', [
      strategyAddress.toHexString()
    ])
  }

  let items = balanceCall.value

  return items
}

export function getPercentage(strategyAddress: Address, item: Address): BigInt {
  let contract = StrategyContract.bind(strategyAddress)

  let balanceCall = contract.try_getPercentage(item)
  if (balanceCall.reverted) {
    log.critical('getPercentage() reverted for {}', [
      strategyAddress.toHexString()
    ])
  }

  let items = balanceCall.value

  return items
}
