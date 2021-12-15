import {} from '@dapplets/dapplet-extension';
import { IOverlayProps } from './types';
import getNfts, { contract, contractState } from './get-nfts';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;
  private _nearWalletLink: string;
  private _overlay: any;
  private _setConfig: any;
  private _cachedNfts = {};
  private _config: any;
  private _theme: 'DARK' | 'LIGHT'

  async activate(): Promise<void> {
    this._nearWalletLink = await Core.storage.get('nearWalletLink');
    const overlayUrl = await Core.storage.get('overlayUrl');
    this._overlay = Core
      .overlay({ name: 'my-nifty-collection-overlay', title: 'My Nifty Collection' })
      .listen({
        connectWallet: async () => {
          try {
            const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
            await wallet.connect();
            this._overlay.send('connectWallet_done', wallet.accountId);
          } catch (err) {
            this._overlay.send('connectWallet_undone', err);
          }
        },
        isWalletConnected: async () => {
          try {
            const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
            const isWalletConnected = await wallet.isConnected();
            this._overlay.send('isWalletConnected_done', isWalletConnected);
          } catch (err) {
            this._overlay.send('isWalletConnected_undone', err);
          }
        },
        getCurrentNearAccount: async () => {
          try {
            const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
            this._overlay.send('getCurrentNearAccount_done', wallet.accountId);
          } catch (err) {
            this._overlay.send('getCurrentNearAccount_undone', err);
          }
        },
        getExternalAccounts: (op: any, { type, message }: any) =>
          contract
            .then((x) => x.getExternalAccounts({ near: message.near }))
            // TODO: .then((x: any) => message.reply(),
            .then((x: any) => this._overlay.send('getExternalAccounts_done', x))
            .catch((err: any) => this._overlay.send('getExternalAccounts_undone', err)),
        getNearAccounts: (op: any, { type, message }: any) =>
          contract
            .then((x) => x.getNearAccounts({ account: message.account }))
            .then((x: any) => this._overlay.send('getNearAccounts_done', x))
            .catch((err: any) => this._overlay.send('getNearAccounts_undone', err)),
        addExternalAccount: (op: any, { type, message }: any) =>
          contract
          .then((x) => x.addExternalAccount({ account: message.account }))
            
            .then((x: any) => this._overlay.send('addExternalAccount_done', x))
            .catch((err: any) => this._overlay.send('addExternalAccount_undone', err)),
        removeExternalAccount: (op: any, { type, message }: any) =>
          contract
          .then((x) => x.removeExternalAccount({ account: message.account }))
            
            .then((x: any) => this._overlay.send('removeExternalAccount_done', x))
            .catch((err: any) => this._overlay.send('removeExternalAccount_undone', err)),

        getNftId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.getNftId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('getNftId_done', x))
            .catch((err: any) => this._overlay.send('getNftId_undone', err)),
        setNftId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.setNftId({ twitterAcc: message.twitterAcc, id: message.id }))
            .then((x: any) => this._overlay.send('setNftId_done', x))
            .catch((err: any) => this._overlay.send('setNftId_undone', err)),
        removeNftId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.removeNftId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('removeNftId_done', x))
            .catch((err: any) => this._overlay.send('removeNftId_undone', err)),

        getNftBadgeId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.getNftBadgeId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('getNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('getNftBadgeId_undone', err)),
        setNftBadgeId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.setNftBadgeId({ twitterAcc: message.twitterAcc, id: message.id }))
            .then((x: any) => this._overlay.send('setNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('setNftBadgeId_undone', err)),
        removeNftBadgeId: (op: any, { type, message }: any) =>
          contractState
          .then((x) => x.removeNftBadgeId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('removeNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('removeNftBadgeId_undone', err)),

        afterLinking: async () => {
          this.adapter.resetConfig(this._config, this._setConfig(true));
          const user = this.adapter.getCurrentUser().username;
          const nfts = await this._cachedNfts[user];
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            nfts,
            index: -1,
            linkStateChanged: true,
            theme: this._theme,
          });
        },
        afterAvatarChanging: async () => {
          this.adapter.resetConfig(this._config, this._setConfig(true));
          const user = this.adapter.getCurrentUser().username;
          const nfts = await this._cachedNfts[user];
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            nfts,
            index: -1,
            theme: this._theme,
          });
        },
      });

    Core.onAction(async () => {
      const user = this.adapter.getCurrentUser().username;
      const nfts = await getNfts(user);
      this.openOverlay({ user, current: true, nfts, index: -1, theme: this._theme });
    });

    /*interface IWidgets {
      widgetType: string;
      indexFrom?: number;
      indexTo: number;
      params?: {};
    }*/

    const addWidgets = (updateNfts: boolean, /*...widgetsParams: IWidgets[]*/) => async (ctx: {
      authorUsername: string;
      theme: 'DARK' | 'LIGHT'
    }) => {
      this._theme = ctx.theme;
      if (!this._cachedNfts[ctx.authorUsername] || updateNfts) {
        this._cachedNfts[ctx.authorUsername] = getNfts(ctx.authorUsername);
      }
      const nfts = await this._cachedNfts[ctx.authorUsername];
      if (nfts === undefined || !nfts.length) return;
      const widgets: any[] = [];
      // let avatarNftIndex = -1;
      // let avatarNftBadgeIndex = -1;
      for (let i = 0; i < nfts.length; i++) {
        if (nfts[i].isAvatar) {
          const avatar = this.adapter.exports.avatar({
            DEFAULT: {
              img: nfts[i].image,
              exec: () => this.openOverlay({
                user: ctx.authorUsername,
                current: ctx.authorUsername === this.adapter.getCurrentUser().username,
                nfts,
                index: i,
                theme: ctx.theme,
              }),
            }
          })
          widgets.push(avatar);
          // avatarNftIndex = i;
        }
        if (nfts[i].isAvatarBadge) {
          const avatarBadge = this.adapter.exports.avatarBadge({
            DEFAULT: {
              img: nfts[i].image,
              vertical: 'bottom',
              horizontal: 'right',
              exec: () => this.openOverlay({
                user: ctx.authorUsername,
                current: ctx.authorUsername === this.adapter.getCurrentUser().username,
                nfts,
                index: i,
                theme: ctx.theme,
              }),
            }
          })
          widgets.push(avatarBadge);
          // avatarNftBadgeIndex = i;
        }
      }
      /*for (const widgetParams of widgetsParams) {
        const { widgetType, indexFrom, indexTo, params } = widgetParams;
        for (let i = indexFrom ?? 0; i < nfts.length && i < indexTo; i++) {
          if (i === avatarNftIndex) continue;
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
      }*/
      return widgets;
    };

    this._setConfig = (updateNfts: boolean = false) => {
      this._config = {
        POST: addWidgets(
           updateNfts,
          /*{
            widgetType: 'avatarBadge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
         {
            widgetType: 'label',
            indexFrom: 1,
            indexTo: 7,
            params: { basic: true },
          },*/
        ),
        PROFILE: addWidgets(
          updateNfts,
          /*{
            widgetType: 'avatarBadge',
            indexTo: 1,
            params: { vertical: 'bottom', horizontal: 'right' },
          },
          {
            widgetType: 'button',
            indexFrom: 1,
            indexTo: 4,
          },*/
        ),
      };
      return this._config;
    };
    this.adapter.attachConfig(this._setConfig());
  }

  async openOverlay(props: IOverlayProps): Promise<void> {
    this._overlay.send('data', { ...props, nearWalletLink: this._nearWalletLink });
  }
}
