import { PersistentUnorderedMap } from "near-sdk-core";
import { Context } from 'near-sdk-core';

// MODELS
const externalByNear = new PersistentUnorderedMap<string, string[]>("a");
const nearByExternal = new PersistentUnorderedMap<string, string[]>("b");

// READ

export function getExternalAccounts(near: string): string[] {
  return (externalByNear.contains(near)) ? externalByNear.getSome(near) : [];
}

export function getNearAccounts(account: string): string[] {
  return (nearByExternal.contains(account)) ? nearByExternal.getSome(account) : [];
}

// WRITE

export function addExternalAccount(account: string): void {
  _insert(externalByNear, Context.sender, account);
  _insert(nearByExternal, account, Context.sender);
}

export function removeExternalAccount(account: string): void {
  _delete(externalByNear, Context.sender, account);
  _delete(nearByExternal, account, Context.sender);
}


export function clearAll(): void {
  externalByNear.clear();
  nearByExternal.clear();
}

// HELPERS

function _insert(map: PersistentUnorderedMap<string, string[]>, key: string, value: string): void {
  if (!map.contains(key)) map.set(key, [value]);

  const arr = map.getSome(key);

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == value) return;
  }

  arr.push(value);
  map.set(key, arr);
}

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