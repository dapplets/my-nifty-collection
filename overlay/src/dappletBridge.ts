import GeneralBridge from '@dapplets/dapplet-overlay-bridge';

class Bridge extends GeneralBridge {
  _subId: number = 0;

  onData(callback: (data: any) => void) {
    this.subscribe('data', (data: any) => {
      ++this._subId;
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

  async isWalletConnected(): Promise<boolean> {
    return this.call('isWalletConnected', null, 'isWalletConnected_done');
  }

  async getCurrentNearAccount(): Promise<string> {
    return this.call('getCurrentNearAccount', null, 'getCurrentNearAccount_done');
  }

  async getExternalAccounts(near: string): Promise<string[]> {
    return this.call('getExternalAccounts', { near }, 'getExternalAccounts_done');
  }

  async getNearAccounts(account: string): Promise<string[]> {
    return this.call('getNearAccounts', { account }, 'getNearAccounts_done');
  }

  async addExternalAccount(account: string): Promise<void> {
    return this.call('addExternalAccount', { account }, 'addExternalAccount_done');
  }

  async removeExternalAccount(account: string): Promise<void> {
    return this.call('removeExternalAccount', { account }, 'removeExternalAccount_done');
  }

  async getNftId(twitterAcc: string): Promise<string> {
    return this.call('getNftId', { twitterAcc }, 'getNftId_done');
  }

  async setNftId(twitterAcc: string, id: string): Promise<void> {
    return this.call('setNftId', { twitterAcc, id }, 'setNftId_done');
  }

  async removeNftId(twitterAcc: string): Promise<void> {
    return this.call('removeNftId', { twitterAcc }, 'removeNftId_done');
  }

  public async call(method: string, args: any, callbackEvent: string): Promise<any> {
    return new Promise((res, rej) => {
      this.publish(this._subId.toString(), {
        type: method,
        message: args,
      });
      this.subscribe(callbackEvent, (result: any) => {
        this.unsubscribe(callbackEvent);
        res(result);
      });
    });
  }
}

const bridge = new Bridge();

export { bridge, Bridge };
