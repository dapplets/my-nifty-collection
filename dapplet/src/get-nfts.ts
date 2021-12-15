import { INftMetadata, ITokenMetadata, ParasResult, PResult } from './types';

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
  const nftContract = await _nftContract;
  try {
    if (typeof accounts === 'string') {
      tokenIds = await nftContract.nft_tokens_for_owner({ account_id: accounts });
    } else {
      const accountsTokenIds = await Promise.all(accounts.map(
        (account: string): Promise<string[]> =>
          nftContract.nft_tokens_for_owner({ account_id: account })
      ));
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
    tokenMetadatas = await Promise.all(tokenIds.map((x) => nftContract.nft_token({ token_id: x })));
  } catch (err) {
    console.log('Cannot get tokenMetadatas from _nftContract by method nft_token().', err);
    tokenMetadatas = [];
  }

  let image: { DARK: string; LIGHT: string };
  try {
    const { icon, reference } = await nftContract.nft_metadata();
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
    .map((tokenMetadata: ITokenMetadata): INftMetadata  => {
      const { title, description, media, issued_at, extra } = tokenMetadata.metadata;
      let parsedExtra: {
        program: string;
        cohort: string;
        owner: string;
      };
      try {
        parsedExtra = JSON.parse(extra);
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
      } catch (e) {
        console.error('Cannot parse tokenMetadatas in method _fetchNftsByNearAcc.', e);
        return {
          name: title,
          description,
          image,
          link: media,
          issued_at,
          id: tokenMetadata.token_id,
        };
      }
    })
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

  const fetchTokens = async (account: string): Promise<any> => {
    const resp = await fetch("https://mintbase-mainnet.hasura.app/v1/graphql", {
      "body": `{
        \"operationName\": \"GET_USER_OWNED_TOKENS\",
        \"variables\": {
          \"account\": \"${account}\",
          \"lastDate\": \"now()\"
        },
        \"query\": \"query GET_USER_OWNED_TOKENS($account: String!, $lastDate: timestamptz!) {\\n  token(where: {lastTransferred: {_lt: $lastDate}, ownerId: {_eq: $account}, _and: {burnedAt: {_is_null: true}}}, order_by: {lastTransferred: desc}, limit: 50) {\\n    id\\n    thingId\\n    ownerId\\n    storeId\\n    store {\\n      id\\n      __typename\\n    }\\n    lastTransferred\\n    thing {\\n      id\\n      metaId\\n      metadata {\\n        title\\n        description\\n        media\\n        media_hash\\n        animation_hash\\n        animation_url\\n        youtube_url\\n        document\\n        document_hash\\n        extra\\n        external_url\\n        category\\n        type\\n        visibility\\n        media_type\\n        animation_type\\n        tags\\n        media_size\\n        animation_size\\n        __typename\\n      }\\n      store {\\n        id\\n        is_external_contract\\n        __typename\\n      }\\n      __typename\\n    }\\n    royaltys {\\n      percent\\n      account\\n      __typename\\n    }\\n    splits {\\n      percent\\n      account\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"
      }`,
      "method": "POST"
    });
    const result = await resp.json();
    return result.data.token;
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();

  return tokens.map(x => ({
    name: x.thing.metadata.title,
    description: x.thing.metadata.description,
    image: {
      LIGHT: x.thing.metadata.media,
      DARK: x.thing.metadata.media
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

  const fetchTokens = async (account: string): Promise<PResult[]> => {
    const resp = await fetch(`https://api-v2-mainnet.paras.id/token?owner_id=${account}`);
    const result: ParasResult = await resp.json();
    return result.data.results;
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();

  return tokens.map((x) => {
    const n = Number(x.metadata.issued_at);
    const date = x.metadata.issued_at !== null ? new Date(x.metadata.issued_at.length > 13 ? n / 1_000_000 : n) : null;
    return{
      name: x.metadata.title,
      description: x.metadata.description,
      image: {
        LIGHT: `https://ipfs.fleek.co/ipfs/${x.metadata.media.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '')}`,
        DARK: `https://ipfs.fleek.co/ipfs/${x.metadata.media.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '')}`,
      },
      issued_at: date === null ? '' : date.toISOString(),
      link: `https://paras.id/token/${x.contract_id}::${x.token_series_id}/${x.token_id}`,
      cohort: '',
      owner: x.owner_id,
      program: '',
      id: x._id,
    };
  });
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

export default async (authorUsername?: string): Promise<INftMetadata[] | undefined> => {
  if (!authorUsername) return;

  let nearAccounts: string[] | undefined;
  try {
    const contr = await contract;
    nearAccounts = await contr.getNearAccounts({ account: authorUsername });
  } catch (err) {
    console.log(
      'Cannot get NEAR accounts by authorUsername:',
      authorUsername,
      'in method _getNfts.',
      err,
    );
  }
  if (nearAccounts === undefined || !nearAccounts.length) return;
  let nfts: INftMetadata[] | undefined;
  try {
    nfts = await fetchNftsByNearAcc(nearAccounts, nftContract);
  } catch (err) {
    console.log('Cannot get NFTs of NEAR accounts:', nearAccounts, 'in method _getNfts.', err);
  }
  if (nfts === undefined || !nfts.length) return;

  const contr = await contractState
  const avatarNftId = await contr.getNftId({ twitterAcc: authorUsername });
  const avatarNftBadgeId = await contr.getNftBadgeId({ twitterAcc: authorUsername });
  nfts.forEach((nft) => {
    nft.isAvatar = nft.id === avatarNftId;
    nft.isAvatarBadge = nft.id === avatarNftBadgeId;
  });

  return nfts;
};
