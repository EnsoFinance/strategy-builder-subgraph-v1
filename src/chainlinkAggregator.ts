import { AnswerUpdated } from '../generated/templates/AggregatorV3/AggregatorV3'
import { triggerCron } from './entities/Cron'
import { useEthUsdFeed } from './entities/EthUsdFeed'
import { isFactory } from './entities/Factory'
import { toBigDecimal } from './helpers/prices'

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let ethUsdFeed = useEthUsdFeed()

  if (event.address.toHexString() != ethUsdFeed.latestAggregator) {
    return
  }

  ethUsdFeed.latestAnswer = toBigDecimal(event.params.current, 8)
  ethUsdFeed.save()

  triggerCron(event.block.timestamp)
}
