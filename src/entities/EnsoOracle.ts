import { Address, log } from '@graphprotocol/graph-ts'
import { EnsoOracle } from '../../generated/schema'

export function useEnsoOracle(): EnsoOracle {
  let oracle = EnsoOracle.load('SINGLETON') as EnsoOracle

  if (oracle == null) {
    log.critical('Oracle does not exist', [])
  }

  return oracle
}

export function ensureEnsoOracle(): EnsoOracle {
  let oracle = EnsoOracle.load('SINGLETON') as EnsoOracle

  if (oracle) {
    return oracle
  }

  oracle = new EnsoOracle('SINGLETON')
  oracle.address = '0xa707cb7839D0303F0cF5080B7F00E922Da4Cf501'

  oracle.save()

  return oracle
}
