import { Address, log } from '@graphprotocol/graph-ts'
import { Token } from '../../generated/schema'
import { getTokenName, getTokenSymbol, getTokenDecimals } from '../helpers/tokens'

export function ensureToken(address: Address): Token {
  let token = Token.load(address.toHexString()) as Token
  if (token) {
    return token
  }

  token = new Token(address.toHex())
  token.symbol = getTokenSymbol(address)
  token.name = getTokenName(address)
  token.decimals = getTokenDecimals(address)
  token.category = 'DEFAULT_ORACLE'
  token.save()

  return token
}

export function useToken(address: Address): Token {
  let token = Token.load(address.toHexString()) as Token
  if (token == null) {
    log.critical('Token {} does not exist', [address.toHexString()])
  }
  return token
}
