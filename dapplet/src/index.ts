import { } from '@dapplets/dapplet-extension';
import {
  IDappState,
  // IDappletApi
} from './types';
import {
  contract,
  // contractState,
  getAvatarNft,
  getAvatarBadgeNft,
  // fetchNftsByNearAcc_NCD,
  // fetchNftsByNearAcc_Paras,
  // fetchNftsByNearAcc_Mintbase,
} from './get-nfts';
import DappletApi from './api';
import LOGO from './icons/myNifty_Logo_3_70x70.png';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  async activate(): Promise<void> {

    const state = Core.state<IDappState>({
      username: null,
      current: false,
      theme: 'LIGHT',
      avatarNft: null,
      avatarNftBadge: null,
      linkStateChanged: false,
    });
  
    // const dappletApi: IDappletApi = {
    //   // WALLET
    //   connectWallet: async () => {
    //     const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    //     await wallet.connect();
    //     return wallet.accountId;
    //   },
    //   isWalletConnected: async () => {
    //     const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    //     return wallet.isConnected();
    //   },
    //   getCurrentNearAccount: async () => {
    //     const wallet = await Core.wallet({ type: 'near', network: 'testnet' });
    //     return wallet.accountId;
    //   },
  
    //   // LINKING ACCOUNTS
    //   getExternalAccounts: async (near: string) => {
    //     const contr = await contract;
    //     return contr.getExternalAccounts({ near });
    //   },
    //   getNearAccounts: async (account: string) => {
    //     const contr = await contract;
    //     return contr.getNearAccounts({ account });
    //   },
    //   addExternalAccount: async (account: string) => {
    //     const contr = await contract;
    //     return contr.addExternalAccount({ account });
    //   },
    //   removeExternalAccount: async (account: string) => {
    //     const contr = await contract;
    //     return contr.removeExternalAccount({ account });
    //   },
  
    //   // AVATAR NFT
    //   getNftId: async (twitterAcc: string) => {
    //     const contr = await contractState;
    //     return contr.getNftId({ twitterAcc });
    //   },
    //   setNftId: async (twitterAcc: string, id: string, source: string, contract: string) => {
    //     const contr = await contractState;
    //     return contr.setNftId({ twitterAcc, id, source, contract });
    //   },
    //   removeNftId: async (twitterAcc: string) => {
    //     const contr = await contractState;
    //     return contr.removeNftId({ twitterAcc });
    //   },
  
    //   // BADGE NFT
    //   getNftBadgeId: async (twitterAcc: string) => {
    //     const contr = await contractState;
    //     return contr.getNftBadgeId({ twitterAcc });
    //   },
    //   setNftBadgeId: async (twitterAcc: string, id: string, source: string, contract: string) => {
    //     const contr = await contractState;
    //     return contr.setNftBadgeId({ twitterAcc, id, source, contract });
    //   },
    //   removeNftBadgeId: async (twitterAcc: string) => {
    //     const contr = await contractState;
    //     return contr.removeNftBadgeId({ twitterAcc });
    //   },
  
    //   // NFTS
    //   getNCDCertificates: (user: string) => fetchNftsByNearAcc_NCD(user),
    //   getParasNFTs: (user: string, page: number, limit: number) => fetchNftsByNearAcc_Paras(user, page, limit),
    //   getMintbaseNFTs: (user: string, page: number, limit: number) => fetchNftsByNearAcc_Mintbase(user, page, limit),
    //   showNfts: async (prevUser?: string) => {
    //     const user = prevUser ?? this.adapter.getCurrentUser().username;
    //     state.all.username.next(user);
    //     state.all.current.next(!prevUser);
    //   },
  
    //   afterLinking: async () => {
    //     const username = this.adapter.getCurrentUser().username;
    //     const avatarNft = await getAvatarNft(username);
    //     const badgeNft = await getAvatarBadgeNft(username);
    //     let currentExternalAccounts: string[] = [];
    //     try {
    //       const c = await contract;
    //       currentExternalAccounts = await c.getNearAccounts({ account: username });
    //     } catch (err) {
    //       console.log('The error in getExternalAccounts(): ', err);
    //     }
    //     const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

    //     if (avatarNft !== null && (
    //       mainnetAccounts.includes(avatarNft.owner!)|| 
    //       avatarNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
    //       currentExternalAccounts.includes(avatarNft.owner!)|| 
    //       avatarNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    //     )) {
    //       state[username].avatarNft.next(avatarNft);
    //       const resp = await fetch(avatarNft.image.LIGHT);
    //       const mediaType = resp.headers.get('Content-Type');
    //       const mediaBlob = await resp.blob();
    //       const mediaUrl = URL.createObjectURL(mediaBlob);
    //       state[username].avatarNft.mediaType.next(mediaType);
    //       state[username].avatarNft.mediaUrl.next(mediaUrl);
    //     } else {
    //       state[username].avatarNft.next(null);
    //     }

    //     if (badgeNft !== null && (
    //       mainnetAccounts.includes(badgeNft.owner!) ||
    //       badgeNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
    //       currentExternalAccounts.includes(badgeNft.owner!) ||
    //       badgeNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    //     )) {
    //       state[username].avatarNftBadge.next(badgeNft);
    //       const resp = await fetch(badgeNft.image.LIGHT);
    //       const mediaType = resp.headers.get('Content-Type');
    //       const mediaBlob = await resp.blob();
    //       const mediaUrl = URL.createObjectURL(mediaBlob);
    //       state[username].avatarNftBadge.mediaType.next(mediaType);
    //       state[username].avatarNftBadge.mediaUrl.next(mediaUrl);
    //     } else {
    //       state[username].avatarNftBadge.next(null);
    //     }

    //     state.all.linkStateChanged.next(true);
    //   },
    //   afterAvatarChanging: async () => {
    //     const username = this.adapter.getCurrentUser().username;
    //     const avatarNft = await getAvatarNft(username);
    //     let currentExternalAccounts: string[] = [];
    //     try {
    //       const c = await contract;
    //       currentExternalAccounts = await c.getNearAccounts({ account: username });
    //     } catch (err) {
    //       console.log('The error in getExternalAccounts(): ', err);
    //     }
    //     const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    //     if (avatarNft !== null && (
    //       mainnetAccounts.includes(avatarNft.owner!)|| 
    //       avatarNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
    //       currentExternalAccounts.includes(avatarNft.owner!)|| 
    //       avatarNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    //     )) {
    //       state[username].avatarNft.next(avatarNft);
    //       const resp = await fetch(avatarNft.image.LIGHT);
    //       const mediaType = resp.headers.get('Content-Type');
    //       const mediaBlob = await resp.blob();
    //       const mediaUrl = URL.createObjectURL(mediaBlob);
    //       state[username].avatarNft.mediaType.next(mediaType);
    //       state[username].avatarNft.mediaUrl.next(mediaUrl);
    //     } else {
    //       state[username].avatarNft.next(null);
    //     }
    //   },
    //   afterAvatarBadgeChanging: async () => {
    //     const username = this.adapter.getCurrentUser().username;
    //     const badgeNft = await getAvatarBadgeNft(username);
    //     let currentExternalAccounts: string[] = [];
    //     try {
    //       const c = await contract;
    //       currentExternalAccounts = await c.getNearAccounts({ account: username });
    //     } catch (err) {
    //       console.log('The error in getExternalAccounts(): ', err);
    //     }
    //     const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);
    //     if (badgeNft !== null && (
    //       mainnetAccounts.includes(badgeNft.owner!) ||
    //       badgeNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true) ||
    //       currentExternalAccounts.includes(badgeNft.owner!) ||
    //       badgeNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
    //     )) {
    //       state[username].avatarNftBadge.next(badgeNft);
    //       const resp = await fetch(badgeNft.image.LIGHT);
    //       const mediaType = resp.headers.get('Content-Type');
    //       const mediaBlob = await resp.blob();
    //       const mediaUrl = URL.createObjectURL(mediaBlob);
    //       state[username].avatarNftBadge.mediaType.next(mediaType);
    //       state[username].avatarNftBadge.mediaUrl.next(mediaUrl);
    //     } else {
    //       state[username].avatarNftBadge.next(null);
    //     }
    //   }
    // };

    const dappletApi = new DappletApi(this.adapter, state);
  
    const overlay = Core.overlay<any, IDappState>({ name: 'my-nifty-collection-overlay', title: 'My Nifty Collection' })
      .useState(state)
      .declare(dappletApi);

    Core.onAction(() => {
      const username = this.adapter.getCurrentUser().username;
      state.all.username.next(username);
      state.all.current.next(true);
      if (!overlay.isOpen()) overlay.open();
    });

    const addWidgets = (insertTo: 'POST' | 'PROFILE') => async (ctx: { authorUsername: string; theme: 'DARK' | 'LIGHT' }) => {
      const { authorUsername, theme } = ctx;
      if (!authorUsername) return;

      state.all.theme.next(theme);

      const contr = await contract;
      const nearAccounts = await contr.getNearAccounts({ account: authorUsername });

      const widgets: any[] = [];

      if (insertTo === 'PROFILE' && nearAccounts.length !== 0) {
        const { username } = this.adapter.getCurrentUser();
        const current = authorUsername === username;
        const widget = this.adapter.exports.button({
          DEFAULT: {
            img: LOGO,
            basic: true,
            exec: () => {
              state.all.username.next(current ? username : authorUsername);
              state.all.current.next(current);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
        widgets.push(widget);
      }

      const avatarNft = await getAvatarNft(authorUsername);
      const badgeNft = await getAvatarBadgeNft(authorUsername);
      let currentExternalAccounts: string[] = [];
      try {
        const c = await contract;
        currentExternalAccounts = await c.getNearAccounts({ account: authorUsername });
      } catch (err) {
        console.log('The error in getExternalAccounts(): ', err);
      }
      const mainnetAccounts = currentExternalAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

      // AVATAR
      if (avatarNft !== null && (
        mainnetAccounts.includes(avatarNft.owner!)
        || avatarNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true)
        || currentExternalAccounts.includes(avatarNft.owner!)
        || avatarNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
      )) {
        state[authorUsername].avatarNft.next(avatarNft);
        const resp = await fetch(avatarNft.image.LIGHT);
        const mediaType = resp.headers.get('Content-Type');
        const mediaBlob = await resp.blob();
        const mediaUrl = URL.createObjectURL(mediaBlob);
        state[authorUsername].username.next(authorUsername);
        state[authorUsername].avatarNft.mediaType.next(mediaType);
        state[authorUsername].avatarNft.mediaUrl.next(mediaUrl);
        // console.log('state[authorUsername].avatarNft.value', state[authorUsername].avatarNft.value)
        const widget = this.adapter.exports.avatar({
          DEFAULT: {
            img: state[authorUsername].avatarNft.mediaUrl,
            mediaType: state[authorUsername].avatarNft.mediaType,
            shape: 'hexagon',
            exec: () => {
              state.all.username.next(authorUsername);
              state.all.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
        widgets.push(widget);
      } else {
        state[authorUsername].avatarNft.next(null);
        state[authorUsername].username.next(authorUsername);
        state[authorUsername].avatarNft.mediaType.next(null);
        state[authorUsername].avatarNft.mediaUrl.next(null);
        // console.log('state[authorUsername].value', state[authorUsername].value)
        // console.log('state[authorUsername].avatarNft.value', state[authorUsername].avatarNft.value)
        const widget = this.adapter.exports.avatar({
          DEFAULT: {
            img: state[authorUsername].avatarNft.mediaUrl,
            mediaType: state[authorUsername].avatarNft.mediaType,
            shape: 'hexagon',
            exec: () => {
              state.all.username.next(authorUsername);
              state.all.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
        widgets.push(widget);
      }

      // AVATAR BADGE
      if (badgeNft !== null && (
        mainnetAccounts.includes(badgeNft.owner!)
        || badgeNft.owner!.split(', ').map(k => mainnetAccounts.includes(k)).includes(true)
        || currentExternalAccounts.includes(badgeNft.owner!)
        || badgeNft.owner!.split(', ').map(k => currentExternalAccounts.includes(k)).includes(true)
      )) {
        state[authorUsername].avatarNftBadge.next(badgeNft);
        const resp = await fetch(badgeNft.image.LIGHT);
        const mediaType = resp.headers.get('Content-Type');
        const mediaBlob = await resp.blob();
        const mediaUrl = URL.createObjectURL(mediaBlob);
        state[authorUsername].username.next(authorUsername);
        state[authorUsername].avatarNftBadge.mediaType.next(mediaType);
        state[authorUsername].avatarNftBadge.mediaUrl.next(mediaUrl);
        const widget = this.adapter.exports.avatarBadge({
          DEFAULT: {
            img: state[authorUsername].avatarNftBadge.mediaUrl,
            mediaType: state[authorUsername].avatarNftBadge.mediaType,
            shape: 'hexagon',
            vertical: 'top',
            horizontal: 'right',
            exec: () => {
              state.all.username.next(authorUsername);
              state.all.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
        widgets.push(widget);
      } else {
        state[authorUsername].avatarNftBadge.next(null);
        state[authorUsername].username.next(authorUsername);
        state[authorUsername].avatarNftBadge.mediaType.next(null);
        state[authorUsername].avatarNftBadge.mediaUrl.next(null);
        // console.log('state[authorUsername].value', state[authorUsername].value)
        // console.log('state[authorUsername].avatarNft.value', state[authorUsername].avatarNft.value)
        const widget = this.adapter.exports.avatarBadge({
          DEFAULT: {
            img: state[authorUsername].avatarNftBadge.mediaUrl,
            mediaType: state[authorUsername].avatarNftBadge.mediaType,
            shape: 'hexagon',
            vertical: 'top',
            horizontal: 'right',
            exec: () => {
              state.all.username.next(authorUsername);
              state.all.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
        widgets.push(widget);
      }

      return widgets;
    };

    const config = {
        POST: addWidgets('POST'),
        PROFILE: addWidgets('PROFILE'),
      };
    this.adapter.attachConfig(config);
  }
}
