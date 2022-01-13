import { BigInt } from "@graphprotocol/graph-ts";

let hour = BigInt.fromI32(3600);
let day = BigInt.fromI32(86400);
let week = BigInt.fromI32(604800);

export function getDayOpenTime(timestamp: BigInt): BigInt {
  let interval = day;
  return getOpenTime(timestamp, interval);
}

export function getPrevious7d(timestamp: BigInt): BigInt {
  return timestamp.minus(week);
}

export function getPreviousDayOpenTime(nextOpenTime: BigInt): BigInt {
  let interval = day;
  let timestamp = nextOpenTime.minus(BigInt.fromString("1"));
  return getOpenTime(timestamp, interval);
}

export function getHourOpenTime(timestamp: BigInt): BigInt {
  let interval = hour;
  return getOpenTime(timestamp, interval);
}

export function getOpenTime(timestamp: BigInt, interval: BigInt): BigInt {
  let excess = timestamp.mod(interval);
  return timestamp.minus(excess);
}
