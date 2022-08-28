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
  oracle.address = '0x90D56e3aa787142873771A226a35355466Ba19D7'

  oracle.save()

  return oracle
}
