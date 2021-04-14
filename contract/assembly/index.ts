import { PersistentUnorderedMap, Context } from 'near-sdk-core';

// MODELS

const externalByNear = new PersistentUnorderedMap<string, string[]>('a');
const nearByExternal = new PersistentUnorderedMap<string, string[]>('b');

// READ

/**
 * Retrieves an array of external accounts for given NEAR Account ID
 * @param near NEAR Account ID
 * @returns Array of external accounts
 */
export function getExternalAccounts(near: string): string[] {
  return externalByNear.contains(near) ? externalByNear.getSome(near) : [];
}

/**
 * Retrieves an array of NEAR Account IDs for given external account
 * @param account External account
 * @returns Array of NEAR Account IDs
 */
export function getNearAccounts(account: string): string[] {
  return nearByExternal.contains(account) ? nearByExternal.getSome(account) : [];
}

// WRITE

/**
 * Adds external account for NEAR Account ID
 * @param account External account
 */
export function addExternalAccount(account: string): void {
  _insert(externalByNear, Context.sender, account);
  _insert(nearByExternal, account, Context.sender);
}

/**
 * Removes external account for NEAR Account ID
 * @param account External account
 */
export function removeExternalAccount(account: string): void {
  _delete(externalByNear, Context.sender, account);
  _delete(nearByExternal, account, Context.sender);
}

/**
 * Clears all storage of the contract (for development stage)
 */
export function clearAll(): void {
  externalByNear.clear();
  nearByExternal.clear();
}

// HELPERS

/**
 * Inserts value to array stored in a map, if value is not exist
 * @param map Map where to insert the value
 * @param key Key in a map, by which array is stored
 * @param value Value to be added to array
 */
function _insert(map: PersistentUnorderedMap<string, string[]>, key: string, value: string): void {
  if (!map.contains(key)) map.set(key, [value]);

  const arr = map.getSome(key);

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == value) return;
  }

  arr.push(value);
  map.set(key, arr);
}

/**
 * Deletes value from array stored in a map, if value is exist
 * @param map Map where to delete the value
 * @param key Key in a map, by which array is stored
 * @param value Value to be removed from array
 */
function _delete(map: PersistentUnorderedMap<string, string[]>, key: string, value: string): void {
  if (!map.contains(key)) return;

  const arr = map.getSome(key);

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == value) {
      arr[i] = arr[arr.length - 1];
      arr.pop();
      break;
    }
  }

  map.set(key, arr);
}
