import { ISharedState } from '@dapplets/dapplet-extension';
import { IDappState, IDappletApi } from './types';
import {
  contract,
  contractState,
  getAvatarNft,
  getAvatarBadgeNft,
  fetchNftsByNearAcc_NCD,
  fetchNftsByNearAcc_Paras,
  fetchNftsByNearAcc_Mintbase,
} from './get-nfts';

export default class implements IDappletApi {

  private adapter: any
  private state: ISharedState<IDappState>

  constructor(adapter: any, state: ISharedState<IDappState>) {
    this.adapter = adapter;
    this.state = state;
  }

  // WALLET
  async connectWallet() {
    const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    await wallet.connect();
    return wallet.accountId;
  }

  async isWalletConnected() {
    const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    return wallet.isConnected();
  }

  async getCurrentNearAccount() {
    const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    return wallet.accountId;
  }

  // LINKING ACCOUNTS
  async getExternalAccounts(near: string) {
    const contr = await contract;
    return contr.getExternalAccounts({ near });
  }

  async getNearAccounts(account: string) {
    const contr = await contract;
    return contr.getNearAccounts({ account });
  }

  async addExternalAccount(account: string) {
    const contr = await contract;
    return contr.addExternalAccount({ account });
  }

  async removeExternalAccount(account: string) {
    const contr = await contract;
    return contr.removeExternalAccount({ account });
  }

  // AVATAR NFT
  async getNftId(twitterAcc: string) {
    const contr = await contractState;
    return contr.getNftId({ twitterAcc });
  }

  async setNftId(twitterAcc: string, id: string, source: string, contract: string) {
    const contr = await contractState;
    return contr.setNftId({ twitterAcc, id, source, contract });
  }

  async removeNftId(twitterAcc: string) {
    const contr = await contractState;
    return contr.removeNftId({ twitterAcc });
  }

  // BADGE NFT
  async getNftBadgeId(twitterAcc: string) {
    const contr = await contractState;
    return contr.getNftBadgeId({ twitterAcc });
  }

  async setNftBadgeId(twitterAcc: string, id: string, source: string, contract: string) {
    const contr = await contractState;
    return contr.setNftBadgeId({ twitterAcc, id, source, contract });
  }

  async removeNftBadgeId(twitterAcc: string) {
    const contr = await contractState;
    return contr.removeNftBadgeId({ twitterAcc });
  }

  // NFTS
  getNCDCertificates(user: string) { return fetchNftsByNearAcc_NCD(user) }

  getParasNFTs(user: string, page: number, limit: number) { return fetchNftsByNearAcc_Paras(user, page, limit) }

  getMintbaseNFTs(user: string, page: number, limit: number) { return fetchNftsByNearAcc_Mintbase(user, page, limit) }

  async showNfts(prevUser?: string) {
    const user = prevUser ?? this.adapter.getCurrentUser().username;
    this.state.all.username.next(user);
    this.state.all.current.next(!prevUser);
  }

  async afterLinking() {
    const username = this.adapter.getCurrentUser().username;
    const avatarNft = await getAvatarNft(username);
    const badgeNft = await getAvatarBadgeNft(username);
    let currentExternalAccounts: string[] = [];
    try {
      const c = await contract;
      currentExternalAccounts = await c.getNearAccounts({ account: username });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
    const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

    if (avatarNft !== null && (
      mainnetAccounts.includes(avatarNft.owner!)|| 
      avatarNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
      currentExternalAccounts.includes(avatarNft.owner!)|| 
      avatarNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    )) {
      this.state[username].avatarNft.next(avatarNft);
      const resp = await fetch(avatarNft.image.LIGHT);
      const mediaType = resp.headers.get('Content-Type');
      const mediaBlob = await resp.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      this.state[username].avatarNft.mediaType.next(mediaType);
      this.state[username].avatarNft.mediaUrl.next(mediaUrl);
    } else {
      this.state[username].avatarNft.next(null);
    }

    if (badgeNft !== null && (
      mainnetAccounts.includes(badgeNft.owner!) ||
      badgeNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
      currentExternalAccounts.includes(badgeNft.owner!) ||
      badgeNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    )) {
      this.state[username].avatarNftBadge.next(badgeNft);
      const resp = await fetch(badgeNft.image.LIGHT);
      const mediaType = resp.headers.get('Content-Type');
      const mediaBlob = await resp.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      this.state[username].avatarNftBadge.mediaType.next(mediaType);
      this.state[username].avatarNftBadge.mediaUrl.next(mediaUrl);
    } else {
      this.state[username].avatarNftBadge.next(null);
    }

    this.state.all.linkStateChanged.next(true);
  }

  async afterAvatarChanging() {
    const username = this.adapter.getCurrentUser().username;
    const avatarNft = await getAvatarNft(username);
    let currentExternalAccounts: string[] = [];
    try {
      const c = await contract;
      currentExternalAccounts = await c.getNearAccounts({ account: username });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
    const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    if (avatarNft !== null && (
      mainnetAccounts.includes(avatarNft.owner!)|| 
      avatarNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
      currentExternalAccounts.includes(avatarNft.owner!)|| 
      avatarNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    )) {
      this.state[username].avatarNft.next(avatarNft);
      const resp = await fetch(avatarNft.image.LIGHT);
      const mediaType = resp.headers.get('Content-Type');
      const mediaBlob = await resp.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      this.state[username].avatarNft.mediaType.next(mediaType);
      this.state[username].avatarNft.mediaUrl.next(mediaUrl);
    } else {
      this.state[username].avatarNft.next(null);
    }
  }

  async afterAvatarBadgeChanging() {
    const username = this.adapter.getCurrentUser().username;
    const badgeNft = await getAvatarBadgeNft(username);
    let currentExternalAccounts: string[] = [];
    try {
      const c = await contract;
      currentExternalAccounts = await c.getNearAccounts({ account: username });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
    const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    if (badgeNft !== null && (
      mainnetAccounts.includes(badgeNft.owner!) ||
      badgeNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
      currentExternalAccounts.includes(badgeNft.owner!) ||
      badgeNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    )) {
      this.state[username].avatarNftBadge.next(badgeNft);
      const resp = await fetch(badgeNft.image.LIGHT);
      const mediaType = resp.headers.get('Content-Type');
      const mediaBlob = await resp.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      this.state[username].avatarNftBadge.mediaType.next(mediaType);
      this.state[username].avatarNftBadge.mediaUrl.next(mediaUrl);
    } else {
      this.state[username].avatarNftBadge.next(null);
    }
  }
}
