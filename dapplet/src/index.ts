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

interface TokenMetadata {
  metadata: {
    title: string;
    description: string;
    media: string;
    issued_at: string;
    extra: string;
  };
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

  private async _fetchNftsByNearAcc(accounts: string | string[]): Promise<NftMetadata[]> {
    let tokenIds: string[];
    try {
      if (typeof accounts === 'string') {
        tokenIds = await this._nftContract.nft_tokens_for_owner({ account_id: accounts });
      } else {
        const accountsTokenIds = await Promise.all(
          accounts.map(
            (account: string): Promise<string[]> =>
              this._nftContract.nft_tokens_for_owner({ account_id: account }),
          ),
        );
        tokenIds = accountsTokenIds.flat();
      }
    } catch (err) {
      console.log(
        'Cannot get tokens of NEAR accounts:',
        accounts,
        'in method _fetchNftsByNearAcc.',
        err,
      );
      tokenIds = [];
    }
    if (!tokenIds.length) return [];

    let tokenMetadatas: TokenMetadata[];
    try {
      tokenMetadatas = await Promise.all(
        tokenIds.map((x) => this._nftContract.nft_token({ token_id: x })),
      );
    } catch (err) {
      console.log('Cannot get tokenMetadatas from _nftContract by method nft_token().', err);
      tokenMetadatas = [];
    }

    let image: string;
    try {
      const { icon } = await this._nftContract.nft_metadata();
      image = <string>icon;
    } catch (err) {
      console.log('Cannot get icon from NFTMetadata of nftContract in method nft_metadata().', err);
    }

    return tokenMetadatas
      .map(
        (tokenMetadata: TokenMetadata): NftMetadata => {
          const { title, description, media, issued_at, extra } = tokenMetadata.metadata;
          let parsedExtra: {
            program: string;
            cohort: string;
            owner: string;
          };
          try {
            parsedExtra = JSON.parse(extra);
          } catch (e) {
            console.error('Cannot parse tokenMetadatas in method _fetchNftsByNearAcc.', e);
          }
          return {
            name: title,
            description,
            image,
            link: media,
            issued_at,
            program: parsedExtra?.program,
            cohort: parsedExtra?.cohort,
            owner: parsedExtra?.owner,
          };
        },
      )
      .sort((a: { issued_at: string }, b: { issued_at: string }): number => {
        const x = new Date(a.issued_at);
        const y = new Date(b.issued_at);
        return y.valueOf() - x.valueOf();
      });
  }

  private async _getNfts(authorUsername?: string): Promise<NftMetadata[]> {
    if (!authorUsername) return;
    let nearAccounts: string[];
    try {
      nearAccounts = await this._contract.getNearAccounts({ account: authorUsername });
    } catch (err) {
      console.log(
        'Cannot get NEAR accounts by authorUsername:',
        authorUsername,
        'in method _getNfts.',
        err,
      );
    }
    if (nearAccounts === undefined || !nearAccounts.length) return;
    let nfts: NftMetadata[];
    try {
      nfts = await this._fetchNftsByNearAcc(nearAccounts);
    } catch (err) {
      console.log('Cannot get NFTs of NEAR accounts:', nearAccounts, 'in method _getNfts.', err);
    }
    if (nfts === undefined || !nfts.length) return;
    return nfts;
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
        POST_AVATAR_BADGE: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await this._getNfts(authorUsername);
          return (
            nfts &&
            badge({
              DEFAULT: {
                vertical: 'bottom',
                horizontal: 'right',
                img: nfts[0].image,
                exec: () => this._openOverlay(authorUsername, 0),
              },
            })
          );
        },
        POST_USERNAME_LABEL: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await this._getNfts(authorUsername);
          if (nfts === undefined || !nfts.length) return;
          const widgets = [];
          for (let i = 1; i < nfts.length && i < 7; i++) {
            widgets.push(
              label({
                DEFAULT: {
                  basic: true,
                  img: nfts[i].image,
                  exec: () => this._openOverlay(authorUsername, i),
                },
              }),
            );
          }
          return widgets;
        },
        PROFILE_AVATAR_BADGE: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await this._getNfts(authorUsername);
          return (
            nfts &&
            badge({
              DEFAULT: {
                vertical: 'bottom',
                horizontal: 'right',
                img: nfts[0].image,
                exec: () => this._openOverlay(authorUsername, 0),
              },
            })
          );
        },
        PROFILE_BUTTON_GROUP: async (ctx: { authorUsername: string }) => {
          const { authorUsername } = ctx;
          const nfts = await this._getNfts(authorUsername);
          if (nfts === undefined || !nfts.length) return;
          const widgets = [];
          for (let i = 1; i < nfts.length && i < 4; i++) {
            widgets.push(
              button({
                DEFAULT: {
                  img: nfts[i].image,
                  exec: () => this._openOverlay(authorUsername, i),
                },
              }),
            );
          }
          return widgets;
        },
      });
    this._setConfig();
  }

  private async _openOverlay(user?: string, index?: number): Promise<void> {
    if (!this._overlay) {
      this._overlay = Core.overlay({
        name: 'nft-viewer',
        title: 'My NFT Collection'
      });
    }
    const currentUser = this.adapter.getCurrentUser();
    try {
      this.nearWalletLink = this.nearWalletLink ?? (await Core.storage.get('nearWalletLink'));
    } catch (err) {
      console.log('Cannot get nearWalletLink from Core.storage in method _openOverlay.', err);
    }

    this._overlay.sendAndListen(
      'data',
      {
        user: user ? user : currentUser.username,
        current: user ? user === currentUser.username : true,
        nearWalletLink: this.nearWalletLink,
        index,
      },
      {
        getNftsByNearAccount: (op: any, { type, message }: any) =>
          this._fetchNftsByNearAcc(message.accounts).then((x) =>
            this._overlay.send('getNftsByNearAccount_done', x),
          ),
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
          this._contract
            .getExternalAccounts({ near: message.near })
            .then((x: any) => this._overlay.send('getExternalAccounts_done', x)),
        getNearAccounts: (op: any, { type, message }: any) =>
          this._contract
            .getNearAccounts({ account: message.account })
            .then((x: any) => this._overlay.send('getNearAccounts_done', x)),
        addExternalAccount: (op: any, { type, message }: any) =>
          this._contract
            .addExternalAccount({ account: message.account })
            .then((x: any) => this._overlay.send('addExternalAccount_done', x)),
        removeExternalAccount: (op: any, { type, message }: any) =>
          this._contract
            .removeExternalAccount({ account: message.account })
            .then((x: any) => this._overlay.send('removeExternalAccount_done', x)),
        afterLinking: () => {
          this.adapter.detachConfig();
          this._setConfig();
        },
      },
    );
  }
}
