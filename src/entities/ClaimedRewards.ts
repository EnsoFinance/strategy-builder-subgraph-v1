import { ClaimedRewardEvent } from '../../generated/schema'

export function ensureClaimedRwards(id: string): ClaimedRewardEvent {
  let claimedRewards = ClaimedRewardEvent.load(id) as ClaimedRewardEvent
  if (claimedRewards) {
    return claimedRewards
  }
  claimedRewards = new ClaimedRewardEvent(id)

  return claimedRewards
}
