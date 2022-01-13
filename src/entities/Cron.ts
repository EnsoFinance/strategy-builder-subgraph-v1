import { BigInt } from '@graphprotocol/graph-ts'
import { Cron } from '../../generated/schema'
import { getHourOpenTime } from '../helpers/times'
import { trackAllDayData } from './DayData'

function ensureCron(): Cron {
  let cron = Cron.load('SINGLETON') as Cron
  if (cron == null) {
    cron = new Cron('SINGLETON')
    cron.cron = BigInt.fromI32(-1)
    cron.save()
  }

  return cron
}

export function triggerCron(timestamp: BigInt): void {
  let cron = ensureCron()

  if (cron.cron.ge(timestamp)) {
    return
  }

  let previousH = getHourOpenTime(cron.cron)
  let currentH = getHourOpenTime(timestamp)

  if (!currentH.gt(previousH)) {
    return
  }

  trackAllDayData(timestamp)
  cron.cron = timestamp
  cron.save()
}
