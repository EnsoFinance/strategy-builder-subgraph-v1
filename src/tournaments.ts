import { Tournament, TournamentStrategyData } from '../generated/schema'
import { store } from '@graphprotocol/graph-ts'
import { NewTournament, Registered, Unregistered } from '../generated/Tournament/Tournament'
import { useTournament } from './entities/Tournaments'
import { ZERO } from './helpers/constants'

export function handleNewTournament(event: NewTournament): void {
  let tournament = new Tournament(event.params.tournamentId.toHexString())
  tournament.startTime = event.params.startTime
  tournament.endTime = event.params.endTime
  tournament.strategiesCount = 0

  tournament.save()
}

export function handleRegister(event: Registered): void {
  let tournament = useTournament(event.params.tournamentId.toHexString())
  tournament.strategiesCount = tournament.strategiesCount + 1
  tournament.save()

  let participant = new TournamentStrategyData(event.params.strategy.toHexString())
  participant.manager = event.params.participant.toHexString()
  participant.strategy = event.params.strategy.toHexString()
  participant.roi = ZERO
  participant.tournament = tournament.id
  participant.save()
}

export function handleUnregister(event: Unregistered): void {
  let id = event.params.participant.toHexString()
  store.remove('TournamentStrategyData', id)
}
