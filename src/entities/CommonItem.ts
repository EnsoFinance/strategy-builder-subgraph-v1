import { log } from '@graphprotocol/graph-ts'
import { CommonItem } from '../../generated/schema'

export function createCommonItemId(item: string, manager: string): string {
  return item + '/' + manager
}

export function useCommonItem(id: string): CommonItem {
  let item = CommonItem.load(id) as CommonItem
  if (item == null) {
    log.critical('CommonItem {} does not exist', [id])
  }

  return item
}

export function ensureCommonItem(itemId: string, managerId: string): CommonItem {
  let id = createCommonItemId(itemId, managerId)
  let item = CommonItem.load(id) as CommonItem
  if (item) {
    return item
  }
  item = new CommonItem(id)
  item.token = itemId

  return item
}
