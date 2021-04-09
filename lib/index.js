'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

let TwitterFeature = class TwitterFeature {
    async _fetchNftsByUser(url, account) {
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
            overlay.sendAndListen('data', {
                user: currentUser.fullname,
                current: true,
                nfts,
            }, {
                onClick: (op, { message }) => { },
            });
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
                            const nft = nfts === null || nfts === void 0 ? void 0 : nfts.find((nft) => nft.name === 'NEAR Certified Developer Program');
                            if (nft) {
                                me.hidden = false;
                                me.img = nft.image;
                                me.nfts = nfts;
                            }
                        },
                        exec: async (ctx, me) => {
                            overlay.sendAndListen('data', {
                                user: ctx.authorFullname,
                                current: ctx.authorUsername === currentUser.username,
                                nfts: me.nfts,
                            }, {
                                onClick: (op, { message }) => { },
                            });
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
                            const nft = nfts === null || nfts === void 0 ? void 0 : nfts.find((nft) => nft.name === 'Zhoucong-Tropical betta by aj.near');
                            if (nft) {
                                me.hidden = false;
                                me.img = nft.image;
                                me.nfts = nfts;
                            }
                        },
                        exec: async (ctx, me) => {
                            overlay.sendAndListen('data', {
                                user: ctx.authorFullname,
                                current: ctx.authorUsername === currentUser.username,
                                nfts: me.nfts,
                            }, {
                                onClick: (op, { message }) => { },
                            });
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
                            const nft = nfts === null || nfts === void 0 ? void 0 : nfts.find((nft) => nft.name === 'Moonloght by sanidwhalecrypto.near');
                            if (nft) {
                                me.hidden = false;
                                me.img = nft.image;
                                me.nfts = nfts;
                            }
                        },
                        exec: async (ctx, me) => {
                            overlay.sendAndListen('data', {
                                user: ctx.authorFullname,
                                current: ctx.authorUsername === currentUser.username,
                                nfts: me.nfts,
                            }, {
                                onClick: (op, { message }) => { },
                            });
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
                            const nft = nfts === null || nfts === void 0 ? void 0 : nfts.find((nft) => nft.name === 'Hyuga Neiji by zhoumi.near');
                            if (nft) {
                                me.hidden = false;
                                me.img = nft.image;
                                me.nfts = nfts;
                            }
                        },
                        exec: async (ctx, me) => {
                            overlay.sendAndListen('data', {
                                user: ctx.authorFullname,
                                current: ctx.authorUsername === currentUser.username,
                                nfts: me.nfts,
                            }, {
                                onClick: (op, { message }) => { },
                            });
                        },
                    },
                }),
            ],
        });
    }
};
__decorate([
    Inject('twitter-adapter.dapplet-base.eth')
], TwitterFeature.prototype, "adapter", void 0);
TwitterFeature = __decorate([
    Injectable
], TwitterFeature);
var TwitterFeature$1 = TwitterFeature;

exports.default = TwitterFeature$1;
