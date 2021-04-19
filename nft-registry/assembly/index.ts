import { PersistentSet, Context, ContractPromise } from 'near-sdk-core';

// MODELS

type AccountID = string;
type NftType = u16;

@nearBindgen
class NftContract {
    constructor(
        public address: AccountID,
        public type: NftType
    ) {}
}

const nftContracts = new PersistentSet<AccountID>('a');

// READ

export function getContracts(): AccountID[] {
    return nftContracts.values();
}

// WRITE

export function addContract(address: AccountID, type: NftType): void {
    assert(type <)
    assert(!nftContracts.has(address), "The address already exists.");
    nftContracts.add(address);
}

export function clearAll(): void {
    nftContracts.clear();
}

// сделать так, чтобы в твиттере показывались именно мои nft


// HELPERS

// registry nearAccount => address nft[]

// если тут проблема, возвратить true
export function checkOwnership(address: AccountID, type: NftType): boolean {
    const promise = ContractPromise.create(
        address,
        remote_method,                     // target contract method name
        remote_method_args,                // target contract method arguments
        BASIC_GAS,                         // gas attached to the call
        u128.Zero                          // deposit attached to the call
      )
    
      promise.returnAsResult()   
}