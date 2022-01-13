import { BigInt, Address, BigDecimal, log } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/StrategyProxyFactory/ERC20";
import { ERC20SymbolBytes } from "../../generated/StrategyProxyFactory/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated/StrategyProxyFactory/ERC20NameBytes";
import { ZERO_ADDRESS } from "../addresses";

function isNullEthValue(value: string): boolean {
  return value == ZERO_ADDRESS;
}

function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
}

export function getTokenSymbol(address: Address): string {
  let contract = ERC20.bind(address);

  let symbolCall = contract.try_symbol();
  let symbol = "Unknown";

  // standard ERC20 implementation
  if (!symbolCall.reverted) {
    return symbolCall.value;
  }

  // non-standard ERC20 implementation
  let bytesContract = ERC20SymbolBytes.bind(address);

  let symbolBytesCall = bytesContract.try_symbol();
  if (!symbolBytesCall.reverted) {
    return symbolBytesCall.value.toString();
  }

  // warning if both calls fail
  log.warning("symbol() call (string or bytes) reverted for {}", [
    address.toHex(),
  ]);
  return symbol;
}

export function getTokenName(address: Address): string {
  let contract = ERC20.bind(address);

  let nameCall = contract.try_name();
  let name = "Unknown";

  // standard ERC20 implementation
  if (!nameCall.reverted) {
    return nameCall.value;
  }

  // non-standard ERC20 implementation
  let bytesContract = ERC20NameBytes.bind(address);

  let nameBytesCall = bytesContract.try_name();
  if (!nameBytesCall.reverted) {
    return nameBytesCall.value.toString();
  }

  // warning if both calls fail
  log.warning("name() call (string or bytes) reverted for {}", [
    address.toHex(),
  ]);
  return name;
}

export function getTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  // try types uint8 for decimals
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue);
}

export function getTokenBalance(
  tokenAddress: Address,
  strategyAddress: Address
): BigDecimal {
  let contract = ERC20.bind(tokenAddress);

  let balanceCall = contract.try_balanceOf(strategyAddress);
  if (balanceCall.reverted) {
    log.critical("balanceOf() reverted for {}", [
      strategyAddress.toHexString(),
    ]);
  }

  return toBigDecimal(balanceCall.value);
}

export function getTotalSupply(tokenAddress: Address): BigDecimal {
  let contract = ERC20.bind(tokenAddress);
  let balanceCall = contract.try_totalSupply();
  if (balanceCall.reverted) {
    log.critical("totalSupply() reverted for {}", [tokenAddress.toHexString()]);
  }
  return toBigDecimal(balanceCall.value);
}
