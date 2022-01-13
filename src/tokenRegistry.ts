import { ItemAdded } from '../generated/TokenRegistry/TokenRegistry'
import { ensureToken } from './entities/Tokens'
import { getTokenCategory } from './helpers/categories'

export function handleItemAdded(event: ItemAdded): void {
  let categoryIndex = event.params.estimatorCategoryIndex

  let token = ensureToken(event.params.token)
  token.category = getTokenCategory(categoryIndex)
  token.save()
}
