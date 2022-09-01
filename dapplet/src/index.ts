import { } from '@dapplets/dapplet-extension';
import { IDappState } from './types';
import { getAvatarNft, getAvatarBadgeNft } from './get-nfts';
import DappletApi from './api';
import LOGO from './icons/MyNifty_Logo_600.png';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  async activate(): Promise<void> {
    const defaultState: IDappState = {
      current: false,
      theme: 'LIGHT',
      linkStateChanged: false,
    };
    if (Core.state === undefined) {
      alert(`
MY NIFTY COLLECTION DAPPLET

Download the latest version of Dapplets Extension here:

https://github.com/dapplets/dapplet-extension/releases/latest
      `);
      return;
    }
    const state = Core.state<IDappState>(defaultState);
    const dappletApi = new DappletApi(this.adapter, state);
    const overlay = Core.overlay<IDappState>({ name: 'my-nifty-collection-overlay', title: 'My Nifty Collection' })
      .useState(state)
      .declare(dappletApi);

    const addAvatarAndBadgeToState = async (username: string) => {
      if (!state[username].username?.value) state[username].username?.next(username);
      const avatarNft = state[username].avatarNft?.value || await getAvatarNft(username);
      const badgeNft = state[username].avatarNftBadge?.value || await getAvatarBadgeNft(username);
      if (!state[username].accounts?.value) {
        const acc = await DappletApi.getTestAndMainNearAccounts(username)
        state[username].accounts?.next(acc);
      }
      if (state[username].accounts?.value && state[username]?.avatarNft?.id.value !== avatarNft?.id) {
        await DappletApi.changeWidgetNft(state[username].accounts?.value!, avatarNft, state[username].avatarNft);
      }
      if (state[username].accounts?.value && state[username].avatarNftBadge?.id.value !== badgeNft?.id) {
        await DappletApi.changeWidgetNft(state[username].accounts?.value!, badgeNft, state[username].avatarNftBadge);
      }
    };

    Core.onAction(async () => {
      const { username } = this.adapter.getCurrentUser();
      await addAvatarAndBadgeToState(username);

      state.global.username?.next(username);
      state.global.current.next(true);
      if (!overlay.isOpen()) overlay.open();
    });

    const addWidgets = (insertTo: 'POST' | 'PROFILE') => async (ctx: { authorUsername: string; theme: 'DARK' | 'LIGHT' }) => {
      const { authorUsername, theme } = ctx;
      if (!authorUsername) return;
      state.global.theme.next(theme);

      await addAvatarAndBadgeToState(authorUsername);

      const { avatar, avatarBadge, button } = this.adapter.exports;
      const widgets = [
        avatar({
          DEFAULT: {
            img: state[authorUsername].avatarNft?.mediaUrl,
            mediaType: state[authorUsername].avatarNft?.mediaType,
            shape: 'hexagon',
            exec: () => {
              state.global.username?.next(authorUsername);
              state.global.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        }),
        avatarBadge({
          DEFAULT: {
            img: state[authorUsername].avatarNftBadge?.mediaUrl,
            mediaType: state[authorUsername].avatarNftBadge?.mediaType,
            shape: 'hexagon',
            vertical: 'top',
            horizontal: 'right',
            exec: () => {
              state.global.username?.next(authorUsername);
              state.global.current.next(authorUsername === this.adapter.getCurrentUser().username);
              if (!overlay.isOpen()) overlay.open();
            },
          }
        })
      ];

      if (insertTo === 'PROFILE' && state[authorUsername].accounts?.testnetAccounts.value.length !== 0) {
        const { username } = this.adapter.getCurrentUser();
        widgets.push(
          button({
            DEFAULT: {
              img: LOGO,
              basic: true,
              exec: () => {
                state.global.username?.next(authorUsername);
                state.global.current.next(authorUsername === username);
                if (!overlay.isOpen()) overlay.open();
              },
            }
          })
        );
      }
      return widgets;
    };

    this.adapter.attachConfig({
      POST: addWidgets('POST'),
      PROFILE: addWidgets('PROFILE')
    });
  }
}
