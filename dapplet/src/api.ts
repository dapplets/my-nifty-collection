import { ISharedState } from '@dapplets/dapplet-extension';
import { IDappState, IDappletApi, INftMetadata } from './types';
import {
  contract,
  contractState,
  getAvatarNft,
  getAvatarBadgeNft,
  fetchNftsByNearAcc_NCD,
  fetchNftsByNearAcc_Paras,
  fetchNftsByNearAcc_Mintbase,
} from './get-nfts';

export default class DappletApi implements IDappletApi {

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
    this.state.global.username?.next(user);
    this.state.global.current.next(!prevUser);
  }

  static getTestAndMainNearAccounts = async (username: string) => {
    let testnetAccounts: string[] = [];
    try {
      const c = await contract;
      testnetAccounts = await c.getNearAccounts({ account: username });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
    const mainnetAccounts = testnetAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    return { testnetAccounts, mainnetAccounts };
  };

  static changeWidgetNft = async (accounts: { testnetAccounts: string[], mainnetAccounts: string[] }, newNft: INftMetadata | null, prevNft: any) => {
    const { testnetAccounts, mainnetAccounts } = accounts;
    if (newNft !== null && (
      mainnetAccounts.includes(newNft.owner!)
      || newNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true)
      || testnetAccounts.includes(newNft.owner!)
      || newNft.owner!.split(', ').map(k => testnetAccounts.includes(k)).includes(true)
    )) {
      const resp = await fetch(newNft.image.LIGHT);
      const mediaType = resp.headers.get('Content-Type');
      const mediaBlob = await resp.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      prevNft.next({ ...newNft, mediaType, mediaUrl });
    } else {
      prevNft.next(null);
    }
  };

  async afterLinking() {
    const { username } = this.adapter.getCurrentUser();
    const avatarNft = await getAvatarNft(username);
    const badgeNft = await getAvatarBadgeNft(username);
    this.state[username].accounts.next(await DappletApi.getTestAndMainNearAccounts(username));
    if (this.state[username].accounts.value) {
      await DappletApi.changeWidgetNft(this.state[username].accounts.value, avatarNft, this.state[username].avatarNft);
      await DappletApi.changeWidgetNft(this.state[username].accounts.value, badgeNft, this.state[username].avatarNftBadge);
    }
    this.state.global.linkStateChanged.next(true);
  }

  async afterAvatarChanging() {
    const { username } = this.adapter.getCurrentUser();
    const avatarNft = await getAvatarNft(username);
    DappletApi.changeWidgetNft(this.state[username].accounts.value, avatarNft, this.state[username].avatarNft);
  }

  async afterAvatarBadgeChanging() {
    const { username } = this.adapter.getCurrentUser();
    const badgeNft = await getAvatarBadgeNft(username);
    DappletApi.changeWidgetNft(this.state[username].accounts.value, badgeNft, this.state[username].avatarNftBadge);
  }
}
