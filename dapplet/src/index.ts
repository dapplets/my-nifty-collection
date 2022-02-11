import {} from '@dapplets/dapplet-extension';
import { INftMetadata, IOverlayProps, ICashedNft } from './types';
import {
  contract,
  contractState,
  getAvatarNft,
  getAvatarBadgeNft,
  fetchNftsByNearAcc_NCD,
  fetchNftsByNearAcc_Paras,
  fetchNftsByNearAcc_Mintbase,
} from './get-nfts';
import LOGO from './icons/myNifty_Logo_3_70x70.png';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  private _overlay: any;
  private _setConfig: any;
  private _config: any;
  private _theme: 'DARK' | 'LIGHT'
  private _cachedNfts: { [name: string]: ICashedNft } = {};

  async activate(): Promise<void> {
    this._overlay = Core
      .overlay({ name: 'my-nifty-collection-overlay', title: 'My Nifty Collection' })
      .listen({

        // WALLET
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

        // LINKING ACCOUNTS
        getExternalAccounts: (op: any, { type, message }: any) =>
          contract
            .then((x) => x.getExternalAccounts({ near: message.near }))
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

        // AVATAR NFT
        getNftId: (op: any, { type, message }: any) =>
          contractState
            .then((x) => x.getNftId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('getNftId_done', x))
            .catch((err: any) => this._overlay.send('getNftId_undone', err)),
        setNftId: (op: any, { type, message }: { type: any, message: { twitterAcc: string, id: string, source: string, contract: string  } }) =>
          contractState
            .then((x) => x.setNftId({ twitterAcc: message.twitterAcc, id: message.id, source: message.source, contract: message.contract }))
            .then((x: any) => this._overlay.send('setNftId_done', x))
            .catch((err: any) => this._overlay.send('setNftId_undone', err)),
        removeNftId: (op: any, { type, message }: any) =>
          contractState
            .then((x) => x.removeNftId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('removeNftId_done', x))
            .catch((err: any) => this._overlay.send('removeNftId_undone', err)),

        // BADGE NFT
        getNftBadgeId: (op: any, { type, message }: any) =>
          contractState
            .then((x) => x.getNftBadgeId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('getNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('getNftBadgeId_undone', err)),
        setNftBadgeId: (op: any, { type, message }: { type: any, message: { twitterAcc: string, id: string, source: string, contract: string } }) =>
          contractState
            .then((x) => x.setNftBadgeId({ twitterAcc: message.twitterAcc, id: message.id, source: message.source, contract: message.contract }))
            .then((x: any) => this._overlay.send('setNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('setNftBadgeId_undone', err)),
        removeNftBadgeId: (op: any, { type, message }: any) =>
          contractState
            .then((x) => x.removeNftBadgeId({ twitterAcc: message.twitterAcc }))
            .then((x: any) => this._overlay.send('removeNftBadgeId_done', x))
            .catch((err: any) => this._overlay.send('removeNftBadgeId_undone', err)),

        // NFTS
        getNCDCertificates: (op: any, { type, message }: { type: any, message: { user: string } }) =>
          fetchNftsByNearAcc_NCD(message.user)
            .then((nfts: INftMetadata[]) => this._overlay.send('getNCDCertificates_done', nfts))
            .catch((err: any) => this._overlay.send('getNCDCertificates_undone', err)),
        getParasNFTs: (op: any, { type, message }: { type: any, message: { user: string, page: number, limit: number } }) =>
          fetchNftsByNearAcc_Paras(message.user, message.page, message.limit)
            .then((nfts: INftMetadata[]) => this._overlay.send('getParasNFTs_done', nfts))
            .catch((err: any) => this._overlay.send('getParasNFTs_undone', err)),
        getMintbaseNFTs: (op: any, { type, message }: { type: any, message: { user: string, page: number, limit: number } }) =>
          fetchNftsByNearAcc_Mintbase(message.user, message.page, message.limit)
            .then((nfts: INftMetadata[]) => this._overlay.send('getMintbaseNFTs_done', nfts))
            .catch((err: any) => this._overlay.send('getMintbaseNFTs_undone', err)),
        showNfts: (op: any, { type, message }: { type: any, message: { prevUser?: string } }) =>
          this.showNfts(message.prevUser)
            .then(() => this._overlay.send('showNfts_done'))
            .catch((err: any) => this._overlay.send('showNfts_undone', err)),

        // RELOAD - ToDo: delete this
        afterLinking: async () => {
          this.adapter.resetConfig(this._config, this._setConfig());
          const user = this.adapter.getCurrentUser().username;
          const avatarNft = await getAvatarNft(user);
          const badgeNft = await getAvatarBadgeNft(user);
          let currentExternalAccounts: string[] = [];
          try {
            const c = await contract;
            currentExternalAccounts = await c.getNearAccounts({ account: user });
          } catch (err) {
            console.log('The error in getExternalAccounts(): ', err);
          }
          const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            avatarNft: avatarNft !== null && mainnetAccounts.includes(avatarNft.owner!) ? avatarNft : null,
            badgeNft: badgeNft !== null && mainnetAccounts.includes(badgeNft.owner!) ? badgeNft : null,
            index: -1,
            theme: this._theme,
            linkStateChanged: true,
          });
        },
        afterAvatarChanging: async () => {
          const user = this.adapter.getCurrentUser().username;
          if (this._cachedNfts[user] === undefined) {
            this._cachedNfts[user] = {};
          }
          this._cachedNfts[user].avatar = undefined;
          this.adapter.resetConfig(this._config, this._setConfig());
          const avatarNft = await getAvatarNft(user);
          const badgeNft = await getAvatarBadgeNft(user);
          let currentExternalAccounts: string[] = [];
          try {
            const c = await contract;
            currentExternalAccounts = await c.getNearAccounts({ account: user });
          } catch (err) {
            console.log('The error in getExternalAccounts(): ', err);
          }
          const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            avatarNft: avatarNft !== null && mainnetAccounts.includes(avatarNft.owner!) ? avatarNft : null,
            badgeNft: badgeNft !== null && mainnetAccounts.includes(badgeNft.owner!) ? badgeNft : null,
            index: -1,
            theme: this._theme
          });
        },
        afterAvatarBadgeChanging: async () => {
          const user = this.adapter.getCurrentUser().username;
          if (this._cachedNfts[user] === undefined) {
            this._cachedNfts[user] = {};
          }
          this._cachedNfts[user].badge = undefined;
          this.adapter.resetConfig(this._config, this._setConfig());
          const avatarNft = await getAvatarNft(user);
          const badgeNft = await getAvatarBadgeNft(user);
          let currentExternalAccounts: string[] = [];
          try {
            const c = await contract;
            currentExternalAccounts = await c.getNearAccounts({ account: user });
          } catch (err) {
            console.log('The error in getExternalAccounts(): ', err);
          }
          const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
          this.openOverlay({
            user,
            current: user === this.adapter.getCurrentUser().username,
            avatarNft: avatarNft !== null && mainnetAccounts.includes(avatarNft.owner!) ? avatarNft : null,
            badgeNft: badgeNft !== null && mainnetAccounts.includes(badgeNft.owner!) ? badgeNft : null,
            index: -1,
            theme: this._theme
          });
        },


      });

    Core.onAction(this.showNfts);

    const addWidgets = (insertTo: 'POST' | 'PROFILE') => async (ctx: { authorUsername: string; theme: 'DARK' | 'LIGHT' }) => {
      const { authorUsername } = ctx;
      if (!authorUsername) return;
      this._theme = ctx.theme;

      const contr = await contract;
      const nearAccounts = await contr.getNearAccounts({ account: authorUsername });

      const widgets: any[] = [];

      if (insertTo === 'PROFILE' && nearAccounts.length !== 0) {
        const current = authorUsername === this.adapter.getCurrentUser().username;
        const widget = this.adapter.exports.button({
          DEFAULT: {
            img: LOGO,
            exec: () => this.showNfts(current ? undefined : authorUsername),
          }
        })
        widgets.push(widget);
      }

      const avatarNft = await getAvatarNft(authorUsername);
      const badgeNft = await getAvatarBadgeNft(authorUsername);
      let currentExternalAccounts: string[] = [];
      try {
        const c = await contract;
        currentExternalAccounts = await c.getNearAccounts({ account: ctx.authorUsername });
      } catch (err) {
        console.log('The error in getExternalAccounts(): ', err);
      }
      const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

      if (avatarNft !== null && mainnetAccounts.includes(avatarNft.owner!)) {
        let mediaUrl: string | undefined;
        let mediaType: string | null | undefined;
        if (this._cachedNfts[authorUsername] === undefined) {
          this._cachedNfts[authorUsername] = {};
        }
        if (this._cachedNfts[authorUsername].avatar === undefined) {
          const resp = await fetch(avatarNft.image.LIGHT);
          mediaType = resp.headers.get('Content-Type');
          const mediaBlob = await resp.blob();
          mediaUrl = URL.createObjectURL(mediaBlob);
          this._cachedNfts[authorUsername].avatar = { mediaType, mediaUrl };
        } else {
          mediaType = this._cachedNfts[authorUsername].avatar?.mediaType;
          mediaUrl = this._cachedNfts[authorUsername].avatar?.mediaUrl;
        }
        const widget = this.adapter.exports.avatar({
          DEFAULT: {
            img: mediaType !== 'application/octet-stream' && mediaUrl,
            video: mediaType === 'application/octet-stream' && mediaUrl,
            shape: 'hexagon',
            exec: () => this.openOverlay({
              user: authorUsername,
              current: authorUsername === this.adapter.getCurrentUser().username,
              index: 0,
              theme: ctx.theme,
              avatarNft,
              badgeNft,
            }),
          }
        })
        widgets.push(widget);
      }

      if (badgeNft !== null && mainnetAccounts.includes(badgeNft.owner!)) {
        let mediaUrl: string | undefined;
        let mediaType: string | null | undefined;
        if (this._cachedNfts[authorUsername] === undefined) {
          this._cachedNfts[authorUsername] = {};
        }
        if (this._cachedNfts[authorUsername].badge === undefined) {
          const resp = await fetch(badgeNft.image.LIGHT);
          mediaType = resp.headers.get('Content-Type');
          const mediaBlob = await resp.blob();
          mediaUrl = URL.createObjectURL(mediaBlob);
          this._cachedNfts[authorUsername].badge = { mediaType, mediaUrl };
        } else {
          mediaType = this._cachedNfts[authorUsername].badge?.mediaType;
          mediaUrl = this._cachedNfts[authorUsername].badge?.mediaUrl;
        }
        const avatarBadge = this.adapter.exports.avatarBadge({
          DEFAULT: {
            img: mediaType !== 'application/octet-stream' && mediaUrl,
            video: mediaType === 'application/octet-stream' && mediaUrl,
            shape: 'hexagon',
            vertical: 'top',
            horizontal: 'right',
            exec: () => this.openOverlay({
              user: authorUsername,
              current: authorUsername === this.adapter.getCurrentUser().username,
              index: 1,
              theme: ctx.theme,
              avatarNft,
              badgeNft,
            }),
          }
        })
        widgets.push(avatarBadge);
      }

      return widgets;
    };

    this._setConfig = () => {
      this._config = {
        POST: addWidgets('POST'),
        PROFILE: addWidgets('PROFILE'),
      };
      return this._config;
    };
    this.adapter.attachConfig(this._setConfig());
  }

  async openOverlay(props: IOverlayProps): Promise<void> {
    this._overlay.send('data', { ...props });
  }

  showNfts = async (prevUser?: string) => {
    const user = prevUser || this.adapter.getCurrentUser().username;
    const avatarNft = await getAvatarNft(user);
    const badgeNft = await getAvatarBadgeNft(user);
    let currentExternalAccounts: string[] = [];
    try {
      const c = await contract;
      currentExternalAccounts = await c.getNearAccounts({ account: user });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
    const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    this.openOverlay({
      user,
      current: !prevUser,
      avatarNft: avatarNft !== null && mainnetAccounts.includes(avatarNft.owner!) ? avatarNft : null,
      badgeNft: badgeNft !== null && mainnetAccounts.includes(badgeNft.owner!) ? badgeNft : null,
      index: -1,
      theme: this._theme
    });
  }
}
