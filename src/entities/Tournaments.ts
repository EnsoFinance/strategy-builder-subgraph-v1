import { log } from '@graphprotocol/graph-ts'
import { Tournament } from '../../generated/schema'

export function useTournament(id: string): Tournament {
  let torunament = Tournament.load(id) as Tournament
  if (torunament == null) {
    log.critical('Tournament {} does not exist', [id])
  }

  return torunament
}
