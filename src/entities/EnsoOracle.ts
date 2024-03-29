import { log } from '@graphprotocol/graph-ts'
import { EnsoOracle } from '../../generated/schema'

export function useEnsoOracle(): EnsoOracle {
  let oracle = EnsoOracle.load('SINGLETON') as EnsoOracle

  if (oracle == null) {
    log.critical('Factory does not exist', [])
  }

  return oracle
}
