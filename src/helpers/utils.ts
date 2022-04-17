import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { ZERO_BD, ONE, HUNDRED } from './constants'

export function addElement(array: string[], element: Address): string[] {
  let newArray = array
  newArray.push(element.toHexString())
  return newArray
}

export function addTimestamp(array: BigInt[], element: BigInt): BigInt[] {
  let newArray = array
  newArray.push(element)
  return newArray
}

export function removeElement(array: string[], element: Address): string[] {
  let newArray = array
  let index = newArray.indexOf(element.toHexString())
  newArray.splice(index, 1)

  return newArray
}

export function arrayDiff<T>(a: T[], b: T[]): T[] {
  let diff: T[] = new Array<T>()
  for (let i: i32 = 0; i < a.length; i++) {
    if (b.indexOf(a[i]) == -1) {
      diff = diff.concat([a[i]])
    }
  }

  return diff
}

export function arrayUnique<T>(array: T[]): T[] {
  let unique: T[] = new Array<T>()
  for (let i: i32 = 0; i < array.length; i++) {
    if (array.indexOf(array[i]) == i) {
      unique = unique.concat([array[i]])
    }
  }

  return unique
}

export function relDiff(a: number, b: number): BigDecimal {
  let diff = 100 * Math.abs((a - b) / ((a + b) / 2))
  return BigDecimal.fromString(diff.toString())
}

export function calcPc(curr: BigDecimal, prev: BigDecimal): BigDecimal {
  let net = curr.minus(prev)

  if (prev.equals(ZERO_BD)) {
    prev = ONE
  }

  return net.div(prev).times(HUNDRED)
}
