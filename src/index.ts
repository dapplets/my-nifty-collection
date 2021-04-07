import {} from '@dapplets/dapplet-extension';
import NFT_IMG from './icons/nft.png';
import NEAR_IMG from './icons/near.svg';
import GREEN_NFT_IMG from './icons/green-nft.png';
import BLUE_NFT_IMG from './icons/blue-nft.png';

@Injectable
export default class TwitterFeature {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/explicit-module-boundary-types
  @Inject('twitter-adapter.dapplet-base.eth') public adapter: any;

  async activate() {
    const overlayUrl = await Core.storage.get('overlayUrl');
    const overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
    Core.onAction(() => {
      overlay.sendAndListen('data', '', {
        onClick: (op, { message }) => {},
      });
    });
    const { badge, label } = this.adapter.exports;
    this.adapter.attachConfig({
      POST_AVATAR_BADGE: [
        badge({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: NFT_IMG,
            vertical: 'top',
            horizontal: 'right',
            hidden: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        badge({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: GREEN_NFT_IMG,
            vertical: 'top',
            horizontal: 'right',
            hidden: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        badge({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: BLUE_NFT_IMG,
            vertical: 'top',
            horizontal: 'right',
            hidden: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        badge({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: NEAR_IMG,
            vertical: 'top',
            horizontal: 'right',
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
      ],
      POST_USERNAME_LABEL: [
        label({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: NFT_IMG,
            basic: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        label({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: GREEN_NFT_IMG,
            basic: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        label({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: BLUE_NFT_IMG,
            basic: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
        label({
          initial: 'HIDDEN',
          HIDDEN: {
            hidden: true,
            init: (ctx, me) => {
              const { username } = this.adapter.getCurrentUser();
              if (ctx.authorUsername === username) {
                me.state = 'DEFAULT';
              }
            },
          },
          DEFAULT: {
            img: NEAR_IMG,
            basic: true,
            hidden: true,
            exec: async () => {
              overlay.sendAndListen('data', '', {
                onClick: (op, { message }) => {},
              });
            },
          },
        }),
      ],
    });
  }
}
