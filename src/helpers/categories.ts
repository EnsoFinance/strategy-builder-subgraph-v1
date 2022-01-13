import { BigInt } from "@graphprotocol/graph-ts";
import { tokenCategories } from "./constants";

export function getTokenCategory(index: BigInt): string {
  let categoryIndex: number = index.toI32();
  return tokenCategories[categoryIndex as u8];
}
