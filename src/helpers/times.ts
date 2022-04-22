import { BigInt, log } from '@graphprotocol/graph-ts'

let hour = BigInt.fromI32(3600)
let day = BigInt.fromI32(86400)
let week = BigInt.fromI32(604800)
let month = BigInt.fromI32(2592000)

export function getDayOpenTime(timestamp: BigInt): BigInt {
  let interval = day
  return getOpenTime(timestamp, interval)
}

export function get7dOpenTime(timestamp: BigInt): BigInt {
  return getDayOpenTime(timestamp.minus(week))
}

export function get30dOpenTime(timestamp: BigInt): BigInt {
  return getDayOpenTime(timestamp.minus(month))
}

export function getPrevDayOpenTime(timestamp: BigInt): BigInt {
  let prevDayTimestamp = timestamp.minus(day)
  log.warning(' timestamp is {}', [timestamp.minus(day).toString()])
  return getDayOpenTime(prevDayTimestamp)
}

export function getHourOpenTime(timestamp: BigInt): BigInt {
  let interval = hour
  return getOpenTime(timestamp, interval)
}

export function getOpenTime(timestamp: BigInt, interval: BigInt): BigInt {
  let excess = timestamp.mod(interval)
  return timestamp.minus(excess)
}

export function isSameDay(t1: BigInt, t2: BigInt): boolean {
  let startOfDay1 = getDayOpenTime(t1)
  let startOfDay2 = getDayOpenTime(t2)

  return startOfDay1.equals(startOfDay2)
}
