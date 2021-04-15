import GeneralBridge from '@dapplets/dapplet-overlay-bridge';

export interface NftMetadata {
  name: string;
  type: string;
  image: string;
  link: string;
}

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

  async getNftsByNearAccount(account: string): Promise<NftMetadata[]> {
    return this.call('getNftsByNearAccount', { account }, 'getNftsByNearAccount_done');
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
