import GeneralBridge from '@dapplets/dapplet-overlay-bridge';

class Bridge extends GeneralBridge {
  _subId: number = 0;

  onData(callback: (data: any) => void) {
    this.subscribe('data', (data: any) => {
      callback(data);
      return (++this._subId).toString();
    });
  }

  // LP: Add method "onClick" that send message to dapplet
  onClick(tickTock: boolean, callback: (data: any) => void) {
    callback(!tickTock);
    this.publish(this._subId.toString(), {
      type: 'onClick',
      message: tickTock ? 'tick' : 'tock',
    });
  }
  // LP end

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
