import {} from '@dapplets/dapplet-extension';

interface NftMetadata {
  name: string;
  type: string;
  image: string;
  link: string;
}

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  private _overlay: any;
  private _contract: any;

  async activate() {
    this._contract = await Core.near.contract('dev-1618391705030-8760988', {
      viewMethods: ['getExternalAccounts', 'getNearAccounts'],
      changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
    });

    Core.onAction(() => this._openOverlay());

    const { badge, label } = this.adapter.exports;

    this.adapter.attachConfig({
      POST_AVATAR_BADGE: [
        badge({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            vertical: 'bottom',
            horizontal: 'right',
            init: (ctx, me) => this._onInitHandler(ctx, me, 0),
            exec: (ctx, me) => this._openOverlay(ctx),
          },
        }),
      ],
      POST_USERNAME_LABEL: [1, 2, 3, 4, 5, 6].map((i) =>
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: (ctx, me) => this._onInitHandler(ctx, me, i),
            exec: (ctx, me) => this._openOverlay(ctx),
          },
        }),
      ),
    }); // end attachConfig
  }

  private async _fetchNftsByNearAcc(account: string): Promise<NftMetadata[]> {
    const nftsUrl = await Core.storage.get('nftsUrl');
    const response = await fetch(nftsUrl);
    const data = await response.json();
    return data[account];
  }

  private async _onInitHandler(ctx: any, me: any, index: number) {
    const nearAccounts = await this._contract.getNearAccounts({ account: ctx.authorUsername });
    if (nearAccounts.length) {
      const nfts = await this._fetchNftsByNearAcc(nearAccounts[0]);
      if (nfts && nfts.length >= index + 1) {
        me.hidden = false;
        me.img = nfts[index].image;
        me.nfts = nfts;
      }
    }
  }

  private async _openOverlay(ctx?: any) {
    if (!this._overlay) {
      const overlayUrl = await Core.storage.get('overlayUrl');
      this._overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
    }

    const currentUser = this.adapter.getCurrentUser();

    this._overlay.sendAndListen(
      'data',
      {
        user: ctx ? ctx.authorUsername : currentUser.username,
        current: ctx ? ctx.authorUsername === currentUser.username : true,
      },
      {
        getNftsByNearAccount: (op, { type, message }) =>
          this._fetchNftsByNearAcc(message.account).then((x) =>
            this._overlay.send('getNftsByNearAccount_done', x),
          ),
        getCurrentNearAccount: Core.near
          .wallet()
          .then((x) => this._overlay.send('getCurrentNearAccount_done', x.accountId)),
        getExternalAccounts: (op, { type, message }) =>
          this._contract
            .getExternalAccounts({ near: message.near })
            .then((x) => this._overlay.send('getExternalAccounts_done', x)),
        getNearAccounts: (op, { type, message }) =>
          this._contract
            .getNearAccounts({ account: message.account })
            .then((x) => this._overlay.send('getNearAccounts_done', x)),
        addExternalAccount: (op, { type, message }) =>
          this._contract
            .addExternalAccount({ account: message.account })
            .then((x) => this._overlay.send('addExternalAccount_done', x)),
        removeExternalAccount: (op, { type, message }) =>
          this._contract
            .removeExternalAccount({ account: message.account })
            .then((x) => this._overlay.send('removeExternalAccount_done', x)),
      },
    );
  }
}
