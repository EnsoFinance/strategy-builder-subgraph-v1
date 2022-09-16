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
  PERFORMANCE,
  TRADE_DATA
}

export let timelockCategories = new Array<string>()
timelockCategories = [
  'RESTRUCTURE',
  'THRESHOLD',
  'REBALANCE_SLIPPAGE',
  'RESTRUCTURE_SLIPPAGE',
  'TIMELOCK',
  'PERFORMANCE',
  'TRADE_DATA'
]

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

export let deprecatedAdapters = new Array<string>()
deprecatedAdapters = [
  '0x6E5DaCDd34032C687B0e2C7b612eee3c850271dE',
  '0xA1835469Cee01ee99A3b5B880Fed714349cDC7a5',
  '0x5303A7a814f5153683b0dD4cD45d41672fA167C8',
  '0x57Ee2D6A665654112aF739e60E7fa7400AF0a8A8',
  '0xf16d11753A687Dc99fE4F98D37Bc822F7388782F',
  '0xEc36e1e39551ea72a8453C42512b3647fD930db9',
  '0x3A24B504616Fc053B10297522523058dDB365AfA',
  '0xE3e1a55ef03cA82b79c60e426612f6aA80b6d9Bf',
  '0x199eFe127B3afa053B55F7713b506A7B8C4e64Cc',
  '0xe3Dc8f700007de47fc72045246D05d24c141ea1A',
  '0x16f5D4B327e5Fd9f87FB29550a26169d0CB160cC',
  '0x9ceF86C92349a75d4c769f919349515946bd5F03',
  '0x23085950d89D3eb169c372D70362B7a40e319701',
  '0xE81b063126e9D5ec6C30257Ef0bE595A370ad894',
  '0x7cd4AFB972CA11e02d571f0733a0d58D18820050',
  '0x7c464a18636CC2f236BC87C70aa4a6F8793DC219',
  '0x61efE98493719509f8bEA2cCC113CFc60ec66d33',
  '0x4F1b641abb967e8440b76DC50e0BD9dFD3abFB23'
]
