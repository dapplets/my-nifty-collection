import {} from '@dapplets/dapplet-extension';
import { overlayProps } from './types';
import getNfts, { contract } from './get-nfts';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;
  private _nearWalletLink: string;
  private _overlay: any;
  private _setConfig: any;
  private _cachedNfts = {};

  async activate(): Promise<void> {
    this._nearWalletLink = await Core.storage.get('nearWalletLink');
    const overlayUrl = await Core.storage.get('overlayUrl');
    this._overlay = Core
      .overlay({ url: overlayUrl, title: 'My Nifty Collection' })
      .listen({
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
            // TODO: .then((x: any) => message.reply(),
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
          const user = this.adapter.getCurrentUser().username;
          const nfts = await getNfts(user);
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            nfts,
            index: -1,
            linkStateChanged: true,
          });
          this._setConfig(true);
        },
      });

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

    const addWidgets = (updateNfts: boolean, ...widgetsParams: IWidgets[]) => async (ctx: {
      authorUsername: string;
    }) => {
      if (!this._cachedNfts[ctx.authorUsername] || updateNfts) {
        this._cachedNfts[ctx.authorUsername] = getNfts(ctx.authorUsername);
      }
      const nfts = await this._cachedNfts[ctx.authorUsername];
      if (nfts === undefined || !nfts.length) return;
      const widgets = [];
      for (const widgetParams of widgetsParams) {
        const { widgetType, indexFrom, indexTo, params } = widgetParams;
        for (let i = indexFrom ?? 0; i < nfts.length && i < indexTo; i++) {
          const defParams = {
            img: nfts[i].image,
            exec: () => this.openOverlay({
              user: ctx.authorUsername,
              current: ctx.authorUsername === this.adapter.getCurrentUser().username,
              nfts,
              index: i,
            }),
            ...params,
          };
          const widget = this.adapter.exports[widgetType]({ DEFAULT: defParams });
          widgets.push(widget);
        }
      }
      return widgets;
    };

    this._setConfig = (updateNfts: boolean = false) => {
      const config = {
        POST: addWidgets(
          updateNfts,
          {
            widgetType: 'avatarBadge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
          {
            widgetType: 'label',
            indexFrom: 1,
            indexTo: 7,
            params: { basic: true },
          },
        ),
        PROFILE: addWidgets(
          updateNfts,
          {
            widgetType: 'avatarBadge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
          {
            widgetType: 'button',
            indexFrom: 1,
            indexTo: 4,
          },
        ),
      };
      this.adapter.attachConfig(config);
    };
    this._setConfig();
  }

  async openOverlay(props: overlayProps): Promise<void> {
    this._overlay.send('data', { ...props, nearWalletLink: this._nearWalletLink });
  }
}
