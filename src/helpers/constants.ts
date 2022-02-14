import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export let ZERO_BD = BigDecimal.fromString('0')
export let ZERO_BI = BigInt.fromString('0')
export let ONE = BigDecimal.fromString('1')
export let HUNDRED = BigDecimal.fromString('100')
export let THOUSAND = BigDecimal.fromString('1000')

export let BASE_ETH = Address.fromString(
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
)
export let QUOTE_USD = Address.fromString(
  '0x0000000000000000000000000000000000000348'
)

// Strategy State categories
export enum TimelockCategory {
  RESTRUCTURE,
  THRESHOLD,
  SLIPPAGE,
  TIMELOCK,
  PERFORMANCE
}

export let tokenCategories = new Array<string>()
tokenCategories = [
  'DEFAULT_ORACLE',
  'CHAINLINK_ORACLE',
  'UNISWAP_TWAP_ORACLE',
  'SUSHI_TWAP_ORACLE',
  'STRATEGY',
  'BLOCKED',
  'AAVE',
  'AAVE_DEBT',
  'BALANCER',
  'COMPOUND',
  'CURVE',
  'CURVE_GAUGE',
  'SUSHI_LP',
  'SUSHI_FARM',
  'UNISWAP_V2_LP',
  'UNISWAP_V3_LP',
  'YEARN_V1',
  'YEARN_V2'
]
