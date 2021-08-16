import { INftMetadata, ITokenMetadata } from './types';

export const contract = Core.contract('near', 'dev-1618391705030-8760988', {
  viewMethods: ['getExternalAccounts', 'getNearAccounts'],
  changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
});

// https://github.com/dapplets/core-contracts/tree/ncd/nft-simple
const nftContract = Core.contract('near', 'dev-1619612403093-1786669', {
  viewMethods: ['nft_metadata', 'nft_tokens_for_owner', 'nft_token'],
  changeMethods: [],
});

export const contractState = Core.contract('near', 'dev-1629115076832-5517488', {
  viewMethods: ['getNftId', 'getNftBadgeId'],
  changeMethods: ['setNftId', 'removeNftId', 'setNftBadgeId', 'removeNftBadgeId'],
});

// TESTING CONTRACT_STATE
/*contractState.getNftId({ twitterAcc: 'twitter.com:tester1' }).then((res1) => {
  console.log(res1);
  contractState.setNftId({ twitterAcc: 'twitter.com:tester1', id: '3' }).then(() => {
    contractState.getNftId({ twitterAcc: 'twitter.com:tester1' }).then((res2) => {
      console.log(res2);
      contractState.removeNftId({ twitterAcc: 'twitter.com:tester1' }).then(() => {
        contractState.getNftId({ twitterAcc: 'twitter.com:tester1' }).then((res3) => console.log(res3));
      });
    });
  });
});*/

const fetchNftsByNearAcc_NCD = async (
  accounts: string | string[],
  _nftContract: any,
): Promise<INftMetadata[]> => {
  let tokenIds: string[];
  try {
    if (typeof accounts === 'string') {
      tokenIds = await _nftContract.nft_tokens_for_owner({ account_id: accounts });
    } else {
      const accountsTokenIds = await Promise.all(
        accounts.map(
          (account: string): Promise<string[]> =>
            _nftContract.nft_tokens_for_owner({ account_id: account }),
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

  let tokenMetadatas: ITokenMetadata[];
  try {
    tokenMetadatas = await Promise.all(
      tokenIds.map((x) => _nftContract.nft_token({ token_id: x })),
    );
  } catch (err) {
    console.log('Cannot get tokenMetadatas from _nftContract by method nft_token().', err);
    tokenMetadatas = [];
  }

  let image: { DARK: string; LIGHT: string };
  try {
    const { icon, reference } = await _nftContract.nft_metadata();
    const res = await fetch(reference);
    const parsedImages = await res.json();
    image = {
      DARK: parsedImages.icon_dark,
      LIGHT: parsedImages.icon_light,
    };
  } catch (err) {
    console.log('Cannot get icon from NFTMetadata of nftContract in method nft_metadata().', err);
  }

  return tokenMetadatas
    .map(
      (tokenMetadata: ITokenMetadata): INftMetadata => {
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
          id: tokenMetadata.token_id,
        };
      },
    )
    .sort((a: { issued_at: string }, b: { issued_at: string }): number => {
      const x = new Date(a.issued_at);
      const y = new Date(b.issued_at);
      return y.valueOf() - x.valueOf();
    });
}

const fetchNftsByNearAcc_Mintbase = async (
  accounts: string | string[]
): Promise<INftMetadata[]> => {
  const accountsArray = Array.isArray(accounts) ? accounts : [accounts];
  const mainnetAccounts = accountsArray.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

  const fetchMetadata = async (metaId: string) => {
    const resp = await fetch(`https://arweave.net/${metaId}`);
    return resp.json();
  }

  const fetchTokens = async (account: string): Promise<any> => {
    const resp = await fetch("https://mintbase-mainnet.hasura.app/v1/graphql", {
      "body": `{\"operationName\":\"token\",\"variables\":{\"account\":\"${account}\",\"limit\":10,\"lastDate\":\"now()\"},\"query\":\"query token($account: String!, $limit: Int!, $lastDate: timestamptz!) {\\n  token(where: {lastTransferred: {_lt: $lastDate}, ownerId: {_eq: $account}, _and: {burnedAt: {_is_null: true}}}, order_by: {lastTransferred: desc}, limit: $limit) {\\n    id\\n    thingId\\n    ownerId\\n    storeId\\n    store {\\n      id\\n      __typename\\n    }\\n    lastTransferred\\n    thing {\\n      id\\n      metaId\\n      store {\\n        id\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`,
      "method": "POST"
    });
    const result = await resp.json();
    return Promise.all(result.data.token.map(token => fetchMetadata(token.thing.metaId).then(metadata => ({ ...token, metadata }))));
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();

  return tokens.map(x => ({
    name: x.metadata.title,
    description: x.metadata.description,
    image: {
      LIGHT: x.metadata.media,
      DARK: x.metadata.media
    },
    issued_at: x.lastTransferred,
    link: `https://www.mintbase.io/thing/${x.thing.id}`,
    cohort: '',
    owner: x.ownerId,
    program: '',
    id: x.id,
  }));
}

const fetchNftsByNearAcc_Paras = async (
  accounts: string | string[]
): Promise<INftMetadata[]> => {
  const accountsArray = Array.isArray(accounts) ? accounts : [accounts];
  const mainnetAccounts = accountsArray.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

  const fetchTokens = async (account: string): Promise<any> => {
    const resp = await fetch(`https://mainnet-api.paras.id/tokens?ownerId=${account}`);
    const result = await resp.json();
    return result.data.results.map(x => ({ ...x, ownerId: account }));
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();

  return tokens.map(x => ({
    name: x.metadata.name,
    description: x.metadata.description,
    image: {
      LIGHT: `https://ipfs.fleek.co/ipfs/${x.metadata.image.replace('ipfs://', '')}`,
      DARK: `https://ipfs.fleek.co/ipfs/${x.metadata.image.replace('ipfs://', '')}`,
    },
    issued_at: new Date(x.createdAt).toISOString(),
    link: `https://paras.id/token/${x.tokenId}`,
    cohort: '',
    owner: x.ownerId,
    program: '',
    id: x._id,
  }));
}

const fetchNftsByNearAcc = async (
  accounts: string | string[],
  _nftContract: any,
): Promise<INftMetadata[]> => {
  const subArraysTokens = await Promise.all([
    fetchNftsByNearAcc_NCD(accounts, _nftContract),
    fetchNftsByNearAcc_Mintbase(accounts),
    fetchNftsByNearAcc_Paras(accounts)
  ]);

  return subArraysTokens.flat();
};

export default async (authorUsername?: string): Promise<INftMetadata[]> => {
  if (!authorUsername) return;

  let nearAccounts: string[];
  try {
    nearAccounts = await contract.getNearAccounts({ account: authorUsername });
  } catch (err) {
    console.log(
      'Cannot get NEAR accounts by authorUsername:',
      authorUsername,
      'in method _getNfts.',
      err,
    );
  }
  if (nearAccounts === undefined || !nearAccounts.length) return;
  let nfts: INftMetadata[];
  try {
    nfts = await fetchNftsByNearAcc(nearAccounts, nftContract);
  } catch (err) {
    console.log('Cannot get NFTs of NEAR accounts:', nearAccounts, 'in method _getNfts.', err);
  }
  if (nfts === undefined || !nfts.length) return;

  const avatarNftId = await contractState.getNftId({ twitterAcc: authorUsername });
  const avatarNftBadgeId = await contractState.getNftBadgeId({ twitterAcc: authorUsername });
  nfts.forEach((nft) => {
    nft.isAvatar = nft.id === avatarNftId;
    nft.isAvatarBadge = nft.id === avatarNftBadgeId;
  });

  return nfts;
};
