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
            POST_USERNAME_LABEL: [1, 2, 3, 4, 5, 6].map((i) => label({
                initial: 'DEFAULT',
                DEFAULT: {
                    hidden: true,
                    basic: true,
                    init: (ctx, me) => this._onInitHandler(ctx, me, i),
                    exec: (ctx, me) => this._openOverlay(ctx),
                },
            })),
        }); // end attachConfig
    }
    async _fetchNftsByNearAcc(account) {
        const nftsUrl = await Core.storage.get('nftsUrl');
        const response = await fetch(nftsUrl);
        const data = await response.json();
        return data[account];
    }
    async _onInitHandler(ctx, me, index) {
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
    async _openOverlay(ctx) {
        if (!this._overlay) {
            const overlayUrl = await Core.storage.get('overlayUrl');
            this._overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
        }
        const currentUser = this.adapter.getCurrentUser();
        this._overlay.sendAndListen('data', {
            user: ctx ? ctx.authorUsername : currentUser.username,
            current: ctx ? ctx.authorUsername === currentUser.username : true,
        }, {
            getNftsByNearAccount: (op, { type, message }) => this._fetchNftsByNearAcc(message.account).then((x) => this._overlay.send('getNftsByNearAccount_done', x)),
            getCurrentNearAccount: Core.near
                .wallet()
                .then((x) => this._overlay.send('getCurrentNearAccount_done', x.accountId)),
            getExternalAccounts: (op, { type, message }) => this._contract
                .getExternalAccounts({ near: message.near })
                .then((x) => this._overlay.send('getExternalAccounts_done', x)),
            getNearAccounts: (op, { type, message }) => this._contract
                .getNearAccounts({ account: message.account })
                .then((x) => this._overlay.send('getNearAccounts_done', x)),
            addExternalAccount: (op, { type, message }) => this._contract
                .addExternalAccount({ account: message.account })
                .then((x) => this._overlay.send('addExternalAccount_done', x)),
            removeExternalAccount: (op, { type, message }) => this._contract
                .removeExternalAccount({ account: message.account })
                .then((x) => this._overlay.send('removeExternalAccount_done', x)),
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
