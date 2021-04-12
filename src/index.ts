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

  private async _fetchNftsByUser(url: string, account: string): Promise<NftMetadata[]> {
    const response = await fetch(url);
    const data = await response.json();
    return data[account];
  }

  async activate() {
    const usersUrl = await Core.storage.get('usersUrl');
    const overlayUrl = await Core.storage.get('overlayUrl');
    const overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
    const currentUser = this.adapter.getCurrentUser();
    Core.onAction(async () => {
      const nfts = await this._fetchNftsByUser(usersUrl, currentUser.username);
      overlay.sendAndListen(
        'data',
        {
          user: currentUser.fullname,
          current: true,
          nfts,
        },
        {
          onClick: (op, { message }) => {},
        },
      );
    });
    const { badge, label } = this.adapter.exports;
    this.adapter.attachConfig({
      POST_AVATAR_BADGE: [
        badge({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            vertical: 'bottom',
            horizontal: 'right',
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 1) {
                me.hidden = false;
                me.img = nfts[0].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
      ],
      POST_USERNAME_LABEL: [
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 2) {
                me.hidden = false;
                me.img = nfts[1].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 3) {
                me.hidden = false;
                me.img = nfts[2].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 4) {
                me.hidden = false;
                me.img = nfts[3].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 5) {
                me.hidden = false;
                me.img = nfts[4].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 6) {
                me.hidden = false;
                me.img = nfts[5].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
        label({
          initial: 'DEFAULT',
          DEFAULT: {
            hidden: true,
            basic: true,
            init: async (ctx, me) => {
              const nfts = await this._fetchNftsByUser(usersUrl, ctx.authorUsername);
              if (nfts && nfts.length >= 7) {
                me.hidden = false;
                me.img = nfts[6].image;
                me.nfts = nfts;
              }
            },
            exec: async (ctx, me) => {
              overlay.sendAndListen(
                'data',
                {
                  user: ctx.authorFullname,
                  current: ctx.authorUsername === currentUser.username,
                  nfts: me.nfts,
                },
                {
                  onClick: (op, { message }) => {},
                },
              );
            },
          },
        }),
      ],
    });
  }
}
