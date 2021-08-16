import { PersistentUnorderedMap } from 'near-sdk-core';

// MODELS

const twitterAvaNfts = new PersistentUnorderedMap<string, string>('a');

const twitterAvaBadgeNfts = new PersistentUnorderedMap<string, string>('b');

// READ

/**
 * Retrieves an ID of NFT for given Twitter Account ID
 * @param twitterAcc Twitter Account ID
 * @returns ID of NFT for Twitter avatar
 */
export function getNftId(twitterAcc: string): string | null {
  return twitterAvaNfts.get(twitterAcc);
}

/**
 * Retrieves an ID of NFT for given Twitter Account ID
 * @param twitterAcc Twitter Account ID
 * @returns ID of NFT for Twitter avatar
 */
export function getNftBadgeId(twitterAcc: string): string | null {
  return twitterAvaBadgeNfts.get(twitterAcc);
}
// WRITE

/**
 * Adds NFT ID for Twitter Account ID
 * @param id NFT ID
 */
export function setNftId(twitterAcc: string, id: string): void {
  twitterAvaNfts.set(twitterAcc, id);
}

/**
 * Adds NFT ID for Twitter Account ID
 * @param id NFT ID
 */
export function setNftBadgeId(twitterAcc: string, id: string): void {
  twitterAvaBadgeNfts.set(twitterAcc, id);
}

/**
 * Removes NFT ID for Twitter Account ID
 * @param id NFT ID
 */
export function removeNftId(twitterAcc: string): void {
  twitterAvaNfts.delete(twitterAcc);
}

/**
 * Removes NFT ID for Twitter Account ID
 * @param id NFT ID
 */
export function removeNftBadgeId(twitterAcc: string): void {
  twitterAvaBadgeNfts.delete(twitterAcc);
}

/**
 * Clears all storage of the contract (for development stage)
 */
export function clearAll(): void {
  twitterAvaNfts.clear();
}

/**
 * Clears all storage of the contract (for development stage)
 */
export function clearAllBadges(): void {
  twitterAvaBadgeNfts.clear();
}
