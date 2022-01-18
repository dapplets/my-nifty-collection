import GeneralBridge from '@dapplets/dapplet-overlay-bridge';

class Bridge extends GeneralBridge {
  _subId: number = 0;

  onData(callback: (data: any) => void) {
    this.subscribe('data', (data: any) => {
      this._subId = Math.trunc(Math.random() * 1_000_000_000);
      callback(data);
      return this._subId.toString();
    });
  }

  afterLinking() {
    this.publish(this._subId.toString(), {
      type: 'afterLinking',
      message: '',
    });
  }

  afterAvatarChanging() {
    this.publish(this._subId.toString(), {
      type: 'afterAvatarChanging',
      message: '',
    });
  }

  async connectWallet(): Promise<string> {
    return this.call('connectWallet', null, 'connectWallet_done', 'connectWallet_undone');
  }

  async isWalletConnected(): Promise<boolean> {
    return this.call('isWalletConnected', null, 'isWalletConnected_done', 'isWalletConnected_undone');
  }

  async getCurrentNearAccount(): Promise<string> {
    return this.call('getCurrentNearAccount', null, 'getCurrentNearAccount_done', 'getCurrentNearAccount_undone');
  }

  async getExternalAccounts(near: string): Promise<string[]> {
    return this.call('getExternalAccounts', { near }, 'getExternalAccounts_done', 'getExternalAccounts_undone');
  }

  async getNearAccounts(account: string): Promise<string[]> {
    return this.call('getNearAccounts', { account }, 'getNearAccounts_done', 'getNearAccounts_undone');
  }

  async addExternalAccount(account: string): Promise<void> {
    return this.call('addExternalAccount', { account }, 'addExternalAccount_done', 'addExternalAccount_undone');
  }

  async removeExternalAccount(account: string): Promise<void> {
    return this.call('removeExternalAccount', { account }, 'removeExternalAccount_done', 'removeExternalAccount_undone');
  }

  async getNftId(twitterAcc: string): Promise<string> {
    return this.call('getNftId', { twitterAcc }, 'getNftId_done', 'getNftId_undone');
  }

  async setNftId(twitterAcc: string, id: string, source: string, contract: string): Promise<void> {
    return this.call(
      'setNftId',
      { twitterAcc, id, source, contract },
      'setNftId_done',
      'setNftId_undone',
    );
  }

  async removeNftId(twitterAcc: string): Promise<void> {
    return this.call('removeNftId', { twitterAcc }, 'removeNftId_done', 'removeNftId_undone');
  }

  async getNftBadgeId(twitterAcc: string): Promise<string> {
    return this.call('getNftBadgeId', { twitterAcc }, 'getNftBadgeId_done', 'getNftBadgeId_undone');
  }

  async setNftBadgeId(twitterAcc: string, id: string, source: string, contract: string): Promise<void> {
    return this.call(
      'setNftBadgeId',
      { twitterAcc, id, source, contract },
      'setNftBadgeId_done',
      'setNftBadgeId_undone',
    );
  }

  async removeNftBadgeId(twitterAcc: string): Promise<void> {
    return this.call('removeNftBadgeId', { twitterAcc }, 'removeNftBadgeId_done', 'removeNftBadgeId_undone');
  }

  async getNCDCertificates(user: string): Promise<any> {
    return this.call(
      'getNCDCertificates',
      { user },
      'getNCDCertificates_done',
      'getNCDCertificates_undone'
    );
  }

  async getParasNFTs(user: string, page: number, limit: number): Promise<any> {
    return this.call(
      'getParasNFTs',
      { user, page, limit },
      'getParasNFTs_done',
      'getParasNFTs_undone'
    );
  }

  async getMintbaseNFTs(user: string, page: number, limit: number): Promise<any> {
    return this.call(
      'getMintbaseNFTs',
      { user, page, limit },
      'getMintbaseNFTs_done',
      'getMintbaseNFTs_undone'
    );
  }

  async showNfts(prevUser?: string): Promise<void> {
    return this.call(
      'showNfts',
      { prevUser },
      'showNfts_done',
      'showNfts_undone'
    );
  }


  public async call(method: string, args: any, callbackEventDone: string, callbackEventUndone: string): Promise<any> {
    return new Promise((res, rej) => {
      this.publish(this._subId.toString(), {
        type: method,
        message: args,
      });
      this.subscribe(callbackEventDone, (result: any) => {
        this.unsubscribe(callbackEventDone);
        this.unsubscribe(callbackEventUndone);
        res(result);
      });
      this.subscribe(callbackEventUndone, () => {
        this.unsubscribe(callbackEventUndone);
        this.unsubscribe(callbackEventDone);
        rej('The transaction was rejected.');
      });
    });
  }
}

const bridge = new Bridge();

export { bridge, Bridge };
