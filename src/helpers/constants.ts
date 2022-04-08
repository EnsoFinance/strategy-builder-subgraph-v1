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
  REBALANCE_SLIPPAGE,
  RESTRUCTURE_SLIPPAGE,
  TIMELOCK,
  PERFORMANCE
}

export let tokenCategories = new Array<string>()
tokenCategories = [
  'DEFAULT_ORACLE',
  'CHAINLINK_ORACLE',
  'STRATEGY',
  'BLOCKED',
  'AAVE_V1',
  'AAVE_V2',
  'AAVE_V2_DEBT',
  'AAVE_V3',
  'AAVE_V3_DEBT',
  'ALCHEMIX',
  'BALANCER_V1_LP',
  'BALANCER_V2_LP',
  'COMP',
  'COMPOUND',
  'CONVEX',
  'CRV',
  'CURVE_LP',
  'CURVE_GAUGE',
  'DOPEX',
  'ENSO',
  'ENSO_STAKED',
  'FLAT',
  'FRAX',
  'LIQUITY',
  'OLYMPUS',
  'RIBBON',
  'SUSHI_BAR',
  'SUSHI_FARM',
  'SUSHI_LP',
  'SUSHI_TWAP_ORACLE',
  'UNISWAP_V2_LP',
  'UNISWAP_V2_TWAP_ORACLE',
  'UNISWAP_V3_LP',
  'YEARN_V1',
  'YEARN_V2'
]
