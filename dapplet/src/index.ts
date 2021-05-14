import { } from '@dapplets/dapplet-extension';
import { overlayProps } from './types';
import getNfts, { contract } from './get-nfts';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;
  private _overlay: any;
  public nearWalletLink: string;
  private _setConfig: any;

  async activate(): Promise<void> {
    // get _overlay
    try {
      const overlayUrl = await Core.storage.get('overlayUrl');
      this._overlay = Core.overlay({ url: overlayUrl, title: 'My Nifty Collection' });
      this._overlay.listen({
        isWalletConnected: async () => {
          try {
            const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
            const isWalletConnected = await wallet.isConnected();
            this._overlay.send('isWalletConnected_done', isWalletConnected);
          } catch (err) {
            console.log('Cannot get Current NEAR Account from Core.wallet.', err);
          }
        },
        getCurrentNearAccount: async () => {
          try {
            const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
            const isWalletConnected = await wallet.isConnected();
            if (!isWalletConnected) await wallet.connect();
            this._overlay.send('getCurrentNearAccount_done', wallet.accountId);
          } catch (err) {
            console.log('Cannot get Current NEAR Account from Core.wallet.', err);
          }
        },
        getExternalAccounts: (op: any, { type, message }: any) =>
          contract
            .getExternalAccounts({ near: message.near })
            .then((x: any) => this._overlay.send('getExternalAccounts_done', x)),
        getNearAccounts: (op: any, { type, message }: any) =>
          contract
            .getNearAccounts({ account: message.account })
            .then((x: any) => this._overlay.send('getNearAccounts_done', x)),
        addExternalAccount: (op: any, { type, message }: any) =>
          contract
            .addExternalAccount({ account: message.account })
            .then((x: any) => this._overlay.send('addExternalAccount_done', x)),
        removeExternalAccount: (op: any, { type, message }: any) =>
          contract
            .removeExternalAccount({ account: message.account })
            .then((x: any) => this._overlay.send('removeExternalAccount_done', x)),
        afterLinking: async () => {
          this.adapter.detachConfig();
          // const user = this.adapter.getCurrentUser().username;
          // const nfts = await getNfts(user);
          // this.openOverlay({ user, current, nfts, index: -1, linkStateChanged: true });
          this._setConfig();
        },
      });
    } catch (err) {
      console.log('Cannot get overlayUrl from Core.storage in method activate().', err);
    }

    // get nearWalletLink
    try {
      this.nearWalletLink = await Core.storage.get('nearWalletLink');
    } catch (err) {
      console.log('Cannot get nearWalletLink from Core.storage in method activate().', err);
    }

    Core.onAction(async () => {
      const user = this.adapter.getCurrentUser().username;
      const nfts = await getNfts(user);
      this.openOverlay({ user, current: true, nfts, index: -1 });
    });

    interface IWidgets {
      type: string;
      indexFrom?: number;
      indexTo: number;
      params?: {};
    }

    const widgets = (props: IWidgets) => async (ctx: { authorUsername: string }) => {
      const nfts = await getNfts(ctx.authorUsername);
      if (nfts === undefined || !nfts.length) return;

      const { type, indexFrom, indexTo, params } = props;
      const widgets = [];
      for (let i = indexFrom ?? 0; i < nfts.length && i < indexTo; i++) {
        const defParams = {
          img: nfts[i].image,
          exec: () => this.openOverlay({ user: ctx.authorUsername, nfts, index: i }),
          ...params,
        };
        const widget = this.adapter.exports[type]({ DEFAULT: defParams });
        widgets.push(widget);
      }
      return widgets;
    };

    this._setConfig = () => {
      const config = {
        POST_AVATAR_BADGE: widgets({
          type: 'badge',
          indexTo: 1,
          params: { vertical: 'bottom', horizontal: 'right' },
        }),
        POST_USERNAME_LABEL: widgets({
          type: 'label',
          indexFrom: 1,
          indexTo: 7,
          params: { basic: true },
        }),
        PROFILE_AVATAR_BADGE: widgets({
          type: 'badge',
          indexTo: 1,
          params: { vertical: 'bottom', horizontal: 'right' },
        }),
        PROFILE_BUTTON_GROUP: widgets({ type: 'button', indexFrom: 1, indexTo: 4 }),
      };
      this.adapter.attachConfig(config);
    };
    this._setConfig();
  }

  async openOverlay(props: overlayProps): Promise<void> {
    const { user, current, nfts, index, linkStateChanged } = props;
    this._overlay.send(
      'data',
      {
        user,
        nfts,
        current: current ?? user === this.adapter.getCurrentUser().username,
        nearWalletLink: this.nearWalletLink,
        index,
        linkStateChanged,
      }
    );
  }
}
