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

  async activate(): Promise<void> {
    // get _overlay
    try {
      const overlayUrl = await Core.storage.get('overlayUrl');
      this._overlay = Core.overlay({ url: overlayUrl, title: 'My Nifty Collection' });
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

    const { badge, label, button } = this.adapter.exports;

    this._setConfig = () =>
      this.adapter.attachConfig({
        POST_AVATAR_BADGE: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await getNfts(authorUsername);
          return (
            nfts &&
            badge({
              DEFAULT: {
                vertical: 'bottom',
                horizontal: 'right',
                img: nfts[0].image,
                exec: () => this.openOverlay({ user: authorUsername, nfts, index: 0 }),
              },
            })
          );
        },
        POST_USERNAME_LABEL: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await getNfts(authorUsername);
          if (nfts === undefined || !nfts.length) return;
          const widgets = [];
          for (let i = 1; i < nfts.length && i < 7; i++) {
            widgets.push(
              label({
                DEFAULT: {
                  basic: true,
                  img: nfts[i].image,
                  exec: () => this.openOverlay({ user: authorUsername, nfts, index: i }),
                },
              }),
            );
          }
          return widgets;
        },
        PROFILE_AVATAR_BADGE: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await getNfts(authorUsername);
          return (
            nfts &&
            badge({
              DEFAULT: {
                vertical: 'bottom',
                horizontal: 'right',
                img: nfts[0].image,
                exec: () => this.openOverlay({ user: authorUsername, nfts, index: 0 }),
              },
            })
          );
        },
        PROFILE_BUTTON_GROUP: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await getNfts(authorUsername);
          if (nfts === undefined || !nfts.length) return;
          const widgets = [];
          for (let i = 1; i < nfts.length && i < 4; i++) {
            widgets.push(
              button({
                DEFAULT: {
                  img: nfts[i].image,
                  exec: () => this.openOverlay({ user: authorUsername, nfts, index: i }),
                },
              }),
            );
          }
          return widgets;
        },
      });
    this._setConfig();
  }

  async openOverlay (props: overlayProps): Promise<void> {
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
            this.openOverlay({ user, current, nfts, index: -1, linkStateChanged: true});
          }
          this._setConfig();
        },
      },
    );
  }
}
