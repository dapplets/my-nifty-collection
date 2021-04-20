import {} from '@dapplets/dapplet-extension';

interface NftMetadata {
  name: string;
  description: string;
  image: string;
  link: string;
  issued_at: string;
  program: string;
  cohort: string;
  owner: string;
}

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  private _overlay: any;
  private _contract: any;
  private _nftContract: any;
  private _setConfig: any;

  private async _fetchNftsByNearAcc(account: string): Promise<NftMetadata[]> {
    const tokenIds = await this._nftContract.nft_tokens_for_owner({ account_id: account });
    if (!tokenIds.length) return [];
    const contractMetadata = await this._nftContract.nft_metadata();
    const tokenMetadatas = await Promise.all(
      tokenIds.map((x) => this._nftContract.nft_token({ token_id: x })),
    );
    return tokenMetadatas.map((x: any) => {
      const { title, description, media, issued_at, extra } = x.metadata;
      let parsedExtra: any;
      try {
        parsedExtra = JSON.parse(extra);
      } catch (e) {
        console.error('Cannot parse tokenMetadatas.', e);
      }
      return {
        name: title,
        description,
        image: contractMetadata.icon,
        link: media,
        issued_at,
        program: parsedExtra?.program,
        cohort: parsedExtra?.cohort,
        owner: parsedExtra?.owner,
      }
    });
  }

  async activate(): Promise<void> {
    this._contract = await Core.near.contract('dev-1618391705030-8760988', {
      viewMethods: ['getExternalAccounts', 'getNearAccounts'],
      changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
    });

    // https://github.com/dapplets/core-contracts/tree/ncd/nft-simple
    this._nftContract = await Core.near.contract('dev-1618836841859-7031732', {
      viewMethods: ['nft_metadata', 'nft_tokens_for_owner', 'nft_token'],
      changeMethods: [],
    });

    const nearWalletLink = await Core.storage.get('nearWalletLink');

    Core.onAction(() => this._openOverlay(nearWalletLink));

    const { badge, label } = this.adapter.exports;
    this._setConfig = () =>
      this.adapter.attachConfig({
        POST_AVATAR_BADGE: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts[0]);
          return (
            nfts &&
            nfts.slice(0, 1).map((n) =>
              badge({
                DEFAULT: {
                  vertical: 'bottom',
                  horizontal: 'right',
                  img: n.image,
                  exec: () => this._openOverlay(nearWalletLink, user),
                },
              }),
            )
          );
        },
        POST_USERNAME_LABEL: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts[0]);
          return (
            nfts &&
            nfts.slice(1, 7).map((n) =>
              label({
                DEFAULT: {
                  basic: true,
                  img: n.image,
                  exec: () => this._openOverlay(nearWalletLink, user),
                },
              }),
            )
          );
        },
      });
    this._setConfig();
  }

  private async _openOverlay(nearWalletLink: string, user?: string): Promise<void> {
    if (!this._overlay) {
      const overlayUrl = await Core.storage.get('overlayUrl');
      this._overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
    }
    const currentUser = this.adapter.getCurrentUser();
    this._overlay.sendAndListen(
      'data',
      {
        user: user ? user : currentUser.username,
        current: user ? user === currentUser.username : true,
        nearWalletLink,
      },
      {
        getNftsByNearAccount: (op, { type, message }) =>
          this._fetchNftsByNearAcc(message.account).then((x) =>
            this._overlay.send('getNftsByNearAccount_done', x),
          ),
        getCurrentNearAccount: () =>
          Core.near
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
        afterLinking: () => {
          this.adapter.detachConfig();
          this._setConfig();
        },
      },
    );
  }
}
