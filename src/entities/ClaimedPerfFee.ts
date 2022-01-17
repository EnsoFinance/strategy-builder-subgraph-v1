import { log } from '@graphprotocol/graph-ts'
import { ClaimedPerfFee } from '../../generated/schema'
import { ZERO } from '../helpers/constants'

export function createClaimedPerfFeeId(
  strategy: string,
  manager: string
): string {
  return strategy + '/' + manager
}

export function useClaimedPerfFee(id: string): ClaimedPerfFee {
  let item = ClaimedPerfFee.load(id) as ClaimedPerfFee
  if (item == null) {
    log.critical('ClaimedPerfFees {} does not exist', [id])
  }

  return item
}

export function ensureClaimedPerfFees(
  strategyId: string,
  managerId: string
): ClaimedPerfFee {
  let id = createClaimedPerfFeeId(strategyId, managerId)
  let claimedPerfFee = ClaimedPerfFee.load(id) as ClaimedPerfFee
  if (claimedPerfFee) {
    return claimedPerfFee
  }
  claimedPerfFee = new ClaimedPerfFee(id)
  claimedPerfFee.strategy = strategyId
  claimedPerfFee.manager = managerId
  claimedPerfFee.amount = ZERO

  return claimedPerfFee
}
