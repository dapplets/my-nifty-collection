import {} from '@dapplets/dapplet-extension';
import { overlayProps } from './types';
import getNfts, { contract } from './get-nfts';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;
  private _overlay: any;
  public nearWalletLink: string;
  private _setConfig: any;
  private _cachedNfts = {};

  async activate(): Promise<void> {
    const overlayUrl = await Core.storage.get('overlayUrl');
    this._overlay = Core.overlay({ url: overlayUrl, title: 'My Nifty Collection' });
    this.nearWalletLink = await Core.storage.get('nearWalletLink');

    Core.onAction(async () => {
      const user = this.adapter.getCurrentUser().username;
      const nfts = await getNfts(user);
      this.openOverlay({ user, current: true, nfts, index: -1 });
    });

    interface IWidgets {
      widgetType: string;
      indexFrom?: number;
      indexTo: number;
      params?: {};
    }

    const addWidgets = (props: IWidgets, updateNfts: boolean) => async (ctx: {
      authorUsername: string;
    }) => {
      if (!this._cachedNfts[ctx.authorUsername] || updateNfts) {
        this._cachedNfts[ctx.authorUsername] = getNfts(ctx.authorUsername);
      }
      const nfts = await this._cachedNfts[ctx.authorUsername];
      if (nfts === undefined || !nfts.length) return;
      const { widgetType, indexFrom, indexTo, params } = props;
      const widgets = [];
      for (let i = indexFrom ?? 0; i < nfts.length && i < indexTo; i++) {
        const defParams = {
          img: nfts[i].image,
          exec: () => this.openOverlay({ user: ctx.authorUsername, nfts, index: i }),
          ...params,
        };
        const widget = this.adapter.exports[widgetType]({ DEFAULT: defParams });
        widgets.push(widget);
      }
      return widgets;
    };

    this._setConfig = (updateNfts: boolean = false) => {
      const config = {
        POST_AVATAR_BADGE: addWidgets(
          {
            widgetType: 'badge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
          updateNfts,
        ),
        POST_USERNAME_LABEL: addWidgets(
          {
            widgetType: 'label',
            indexFrom: 1,
            indexTo: 7,
            params: { basic: true },
          },
          updateNfts,
        ),
        PROFILE_AVATAR_BADGE: addWidgets(
          {
            widgetType: 'badge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
          updateNfts,
        ),
        PROFILE_BUTTON_GROUP: addWidgets(
          { widgetType: 'button', indexFrom: 1, indexTo: 4 },
          updateNfts,
        ),
      };
      this.adapter.attachConfig(config);
    };
    this._setConfig();
  }

  async openOverlay(props: overlayProps): Promise<void> {
    const { user, current, nfts, index, linkStateChanged } = props;
    this._overlay.sendAndListen(
      'data',
      {
        user,
        nfts,
        current: current ?? user === this.adapter.getCurrentUser().username,
        nearWalletLink: this.nearWalletLink,
        index,
        linkStateChanged,
      },
      {
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
          if (this._overlay) {
            const user = this.adapter.getCurrentUser().username;
            const nfts = await getNfts(user);
            this.openOverlay({ user, current, nfts, index: -1, linkStateChanged: true });
          }
          this._setConfig(true);
        },
      },
    );
  }
}
