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
    async _fetchNftsByNearAcc(account) {
        const tokenIds = await this._nftContract.nft_tokens_for_owner({ account_id: account });
        if (!tokenIds.length)
            return [];
        const contractMetadata = await this._nftContract.nft_metadata();
        const tokenMetadatas = await Promise.all(tokenIds.map((x) => this._nftContract.nft_token({ token_id: x })));
        const result = tokenMetadatas.map((x) => {
            const { title, description, media, issued_at, extra } = x.metadata;
            let parsedExtra = {};
            try {
                parsedExtra = JSON.parse(extra);
            }
            catch (e) {
                console.error('Cannot parse tokenMetadatas. ', e);
            }
            return {
                name: title,
                description,
                image: contractMetadata.icon,
                link: media,
                issued_at,
                program: parsedExtra.program,
                cohort: parsedExtra.cohort,
                owner: parsedExtra.owner,
            };
        });
        return result;
    }
    async activate() {
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
        this._setConfig = () => this.adapter.attachConfig({
            POST_AVATAR_BADGE: async (ctx) => {
                const user = ctx.authorUsername;
                if (!user)
                    return;
                const nearAccounts = await this._contract.getNearAccounts({ account: user });
                if (!nearAccounts.length)
                    return;
                const nfts = await this._fetchNftsByNearAcc(nearAccounts[0]);
                return (nfts &&
                    nfts.slice(0, 1).map((n) => badge({
                        DEFAULT: {
                            vertical: 'bottom',
                            horizontal: 'right',
                            img: n.image,
                            exec: () => this._openOverlay(nearWalletLink, user),
                        },
                    })));
            },
            POST_USERNAME_LABEL: async (ctx) => {
                const user = ctx.authorUsername;
                if (!user)
                    return;
                const nearAccounts = await this._contract.getNearAccounts({ account: user });
                if (!nearAccounts.length)
                    return;
                const nfts = await this._fetchNftsByNearAcc(nearAccounts[0]);
                return (nfts &&
                    nfts.slice(1, 7).map((n) => label({
                        DEFAULT: {
                            basic: true,
                            img: n.image,
                            exec: () => this._openOverlay(nearWalletLink, user),
                        },
                    })));
            },
        });
        console.log('in activate()');
        this._setConfig();
    }
    async _openOverlay(nearWalletLink, user) {
        if (!this._overlay) {
            const overlayUrl = await Core.storage.get('overlayUrl');
            this._overlay = Core.overlay({ url: overlayUrl, title: 'Overlay' });
        }
        const currentUser = this.adapter.getCurrentUser();
        this._overlay.sendAndListen('data', {
            user: user ? user : currentUser.username,
            current: user ? user === currentUser.username : true,
            nearWalletLink,
        }, {
            getNftsByNearAccount: (op, { type, message }) => this._fetchNftsByNearAcc(message.account).then((x) => this._overlay.send('getNftsByNearAccount_done', x)),
            getCurrentNearAccount: () => Core.near
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
            afterLinking: () => {
                //this._setConfig();
                console.log('Linked!');
            },
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
