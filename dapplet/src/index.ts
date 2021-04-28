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
  public nearWalletLink: string;

  private async _fetchNftsByNearAcc(accounts: string[] | string): Promise<NftMetadata[]> {
    let tokenIds: string[];
    if (typeof accounts === 'string') {
      tokenIds = await this._nftContract.nft_tokens_for_owner({ account_id: accounts });
    } else {
      const promisesOfTokens = accounts.map(
        (account: string): Promise<string[]> =>
          this._nftContract.nft_tokens_for_owner({ account_id: account }),
      );
      const accountsTokenIds = await Promise.all(promisesOfTokens);
      tokenIds = accountsTokenIds.flat();
    }
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
      };
    });
  }

  async activate(): Promise<void> {
    this._contract = Core.contract('near', 'dev-1618391705030-8760988', {
      viewMethods: ['getExternalAccounts', 'getNearAccounts'],
      changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
    });

    // https://github.com/dapplets/core-contracts/tree/ncd/nft-simple
    this._nftContract = Core.contract('near', 'dev-1619612403093-1786669', {
      viewMethods: ['nft_metadata', 'nft_tokens_for_owner', 'nft_token'],
      changeMethods: [],
    });

    Core.onAction(() => this._openOverlay());

    const { badge, label, button } = this.adapter.exports;
    this._setConfig = () =>
      this.adapter.attachConfig({
        POST_AVATAR_BADGE: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts);
          if (!nfts.length) return;
          return badge({
            DEFAULT: {
              vertical: 'bottom',
              horizontal: 'right',
              img: nfts[nfts.length - 1].image,
              exec: () => this._openOverlay(user, 0),
            },
          });
        },
        POST_USERNAME_LABEL: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts);
          if (!nfts.length) return;
          return nfts
            .reverse()
            .slice(1, 7)
            .map((nft, i) =>
              label({
                DEFAULT: {
                  basic: true,
                  img: nft.image,
                  exec: () => this._openOverlay(user, i + 1),
                },
              }),
            );
        },
        PROFILE_AVATAR_BADGE: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts);
          if (!nfts.length) return;
          return badge({
            DEFAULT: {
              vertical: 'bottom',
              horizontal: 'right',
              img: nfts[nfts.length - 1].image,
              exec: () => this._openOverlay(user, 0),
            },
          });
        },
        PROFILE_BUTTON_GROUP: async (ctx) => {
          const user = ctx.authorUsername;
          if (!user) return;
          const nearAccounts = await this._contract.getNearAccounts({ account: user });
          if (!nearAccounts.length) return;
          const nfts = await this._fetchNftsByNearAcc(nearAccounts);
          if (!nfts.length) return;
          return nfts
            .reverse()
            .slice(1, 4)
            .map((nft, i) =>
              button({
                DEFAULT: {
                  label: '',
                  img: nft.image,
                  exec: () => this._openOverlay(user, i + 1),
                },
              }),
            );
        },
      });
    this._setConfig();
  }

  private async _openOverlay(user?: string, index?: number): Promise<void> {
    if (!this._overlay) {
      const overlayUrl = await Core.storage.get('overlayUrl');
      this._overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
    }
    const currentUser = this.adapter.getCurrentUser();
    this.nearWalletLink = this.nearWalletLink ?? (await Core.storage.get('nearWalletLink'));
    this._overlay.sendAndListen(
      'data',
      {
        user: user ? user : currentUser.username,
        current: user ? user === currentUser.username : true,
        nearWalletLink: this.nearWalletLink,
        index,
      },
      {
        getNftsByNearAccount: (op, { type, message }) =>
          this._fetchNftsByNearAcc(message.accounts).then((x) =>
            this._overlay.send('getNftsByNearAccount_done', x),
          ),
        getCurrentNearAccount: async () => {
          const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
          if (!(await wallet.isConnected())) {
            await wallet.connect();
          }
          this._overlay.send('getCurrentNearAccount_done', wallet.accountId);
        },
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
