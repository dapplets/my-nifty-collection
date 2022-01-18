import { INftMetadata, ITokenMetadata, ParasResult, PResult } from './types';

export const contract = Core.contract('near', 'dev-1618391705030-8760988', {
  viewMethods: ['getExternalAccounts', 'getNearAccounts'],
  changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
});

export const contractState = Core.contract('near', 'dev-1642431481837-36721367716677', {
  viewMethods: ['getNftId', 'getNftBadgeId'],
  changeMethods: ['setNftId', 'removeNftId', 'setNftBadgeId', 'removeNftBadgeId'],
});

// https://github.com/dapplets/core-contracts/tree/ncd/nft-simple
const nftContract = Core.contract('near', 'dev-1619612403093-1786669', {
  viewMethods: ['nft_metadata', 'nft_tokens_for_owner', 'nft_token'],
  changeMethods: [],
});

const getNearAccByTwitterAcc = async (twitterId: string): Promise<string[] | undefined> => {
  try {
    const contr = await contract;
    const nearAccounts = await contr.getNearAccounts({ account: twitterId });
    if (nearAccounts === undefined || !nearAccounts.length) return;
    return Array.isArray(nearAccounts) ? nearAccounts : [nearAccounts];
  } catch (err) {
    console.log(
      'Cannot get NEAR accounts by authorUsername:',
      twitterId,
      'in method _getNfts.',
      err,
    );
  }
}

const makeNftMetadata_Paras = (x: PResult): INftMetadata => {
  const isNumeric = (a) => !isNaN(a);
  const issued_at = x.metadata.issued_at;
  const n = Number(issued_at);
  const date = issued_at !== null ? ((isNumeric(issued_at)) ? new Date(issued_at.length > 13 ? n / 1_000_000 : n) : new Date(issued_at)) : null;
  
  return {
    name: x.metadata.title,
    description: x.metadata.description,
    image: {
      LIGHT: x.contract_id === 'x.paras.near'
        ? `https://ipfs.fleek.co/ipfs/${x.metadata.media.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '')}`
        : x.metadata.media,
      DARK: x.contract_id === 'x.paras.near'
        ? `https://ipfs.fleek.co/ipfs/${x.metadata.media.replace('ipfs://', '').replace('https://ipfs.io/ipfs/', '')}`
        : x.metadata.media,
    },
    issued_at: date === null ? '' : date.toISOString(),
    link: `https://paras.id/token/${x.contract_id}::${x.token_series_id}/${x.token_id}`,
    cohort: '',
    owner: x.owner_id,
    program: '',
    id: x.token_id,
    source: 'paras',
    contract: x.contract_id,
  };
};

const makeNftMetadata_Mintbase = (thing: any, ownerId?: string): INftMetadata => ({
  name: thing.metadata.title,
  description: thing.metadata.description,
  image: {
    LIGHT: thing.metadata.media,
    DARK: thing.metadata.media
  },
  link: `https://www.mintbase.io/thing/${thing.id}`,
  owner: ownerId || thing.tokens.map((token) => token.ownerId).join(', '),
  issued_at: '',
  cohort: '',
  program: '',
  id: thing.id,
  source: 'mintbase',
  contract: '',
});

const fetchNfts_NCD = async (authorUsername: string, nftId?: string): Promise<INftMetadata[] | INftMetadata | undefined | null> => {
  const nearAccounts = await getNearAccByTwitterAcc(authorUsername);
  if (nearAccounts === undefined) return;
  const contr = await nftContract;
  let tokenIds: string[];
  try {
    const a = nearAccounts.map((account: string): Promise<string[]> => contr.nft_tokens_for_owner({ account_id: account }));
    const accountsTokenIds = await Promise.all(a);
    tokenIds = accountsTokenIds.flat();
  } catch (err) {
    console.log(
      'Cannot get tokens of NEAR accounts:',
      nearAccounts,
      'in method _fetchNftsByNearAcc.',
      err,
    );
    tokenIds = [];
  }
  if (!tokenIds.length) return [];

  let tokenMetadatas: ITokenMetadata[];
  try {
    tokenMetadatas = await Promise.all(tokenIds.map((x) => contr.nft_token({ token_id: x })));
  } catch (err) {
    console.log('Cannot get tokenMetadatas from _nftContract by method nft_token().', err);
    tokenMetadatas = [];
  }

  let image: { DARK: string; LIGHT: string } = { DARK: '', LIGHT: '' };
  try {
    const { icon, reference } = await contr.nft_metadata();
    const res = await fetch(reference);
    const parsedImages = await res.json();
    image = {
      DARK: parsedImages.icon_dark,
      LIGHT: parsedImages.icon_light,
    };
  } catch (err) {
    console.log('Cannot get icon from NFTMetadata of nftContract in method nft_metadata().', err);
  }

  const makeNftMetadata_NCD = (tokenMetadata: ITokenMetadata, image: { DARK: string, LIGHT: string }): INftMetadata => {
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
        source: 'ncd',
        contract: '',
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
        source: 'ncd',
        contract: '',
      };
    }
  };

  if (nftId) {
    const tokenMetadata = tokenMetadatas.find((metadata) => metadata.token_id === nftId[0]);
    if (!tokenMetadata) return null;
    return makeNftMetadata_NCD(tokenMetadata, image);
  } else {
    return tokenMetadatas
      .map((tokenMetadata: ITokenMetadata): INftMetadata => makeNftMetadata_NCD(tokenMetadata, image))
      .sort((a: { issued_at: string }, b: { issued_at: string }): number => {
        const x = new Date(a.issued_at);
        const y = new Date(b.issued_at);
        return y.valueOf() - x.valueOf();
      });
  }
}

export const fetchNftsByNearAcc_NCD = (authorUsername: string): Promise<INftMetadata[] | undefined | INftMetadata | null> => fetchNfts_NCD(authorUsername);

export const fetchNftsByNearAcc_Paras = async (authorUsername: string, page = 1, limit: number): Promise<INftMetadata[] | undefined> => {
  const nearAccounts = await getNearAccByTwitterAcc(authorUsername);
  if (nearAccounts === undefined) return;
  const mainnetAccounts = nearAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

  const fetchTokens = async (account: string): Promise<PResult[]> => {
    const resp = await fetch(`https://api-v2-mainnet.paras.id/token?owner_id=${account}&__limit=${limit + 1}&__skip=${(page - 1) * limit}`);
    const result: ParasResult = await resp.json();
    return result.data.results;
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();

  return tokens.map(makeNftMetadata_Paras);
};

export const fetchNftsByNearAcc_Mintbase = async (authorUsername: string, page = 1, limit: number): Promise<INftMetadata[] | undefined> => {
  const nearAccounts = await getNearAccByTwitterAcc(authorUsername);
  if (nearAccounts === undefined) return;
  const mainnetAccounts = nearAccounts.map(x => x.endsWith('.testnet') ? x.replace(/.testnet$/gm, '.near') : x);

  const fetchTokens = async (account: string): Promise<any> => {
    const resp = await fetch("https://mintbase-mainnet.hasura.app/v1/graphql", {
      "body": `{
        \"operationName\": \"GET_USER_OWNED_TOKENS\",
        \"variables\": {
          \"account\": \"${account}\",
          \"lastDate\": \"now()\",
          \"limit\": ${limit + 1},
          \"offset\": ${(page - 1) * limit}
        },
        \"query\": \"query GET_USER_OWNED_TOKENS($account: String!, $lastDate: timestamptz!, $limit: Int!, $offset: Int!) {\\n  token(where: {lastTransferred: {_lt: $lastDate}, ownerId: {_eq: $account}, _and: {burnedAt: {_is_null: true}}}, order_by: {lastTransferred: desc}, limit: $limit, offset: $offset) {\\n    id\\n    thingId\\n    ownerId\\n    storeId\\n    store {\\n      id\\n      __typename\\n    }\\n    lastTransferred\\n    thing {\\n      id\\n      metaId\\n      metadata {\\n        title\\n        description\\n        media\\n        media_hash\\n        animation_hash\\n        animation_url\\n        youtube_url\\n        document\\n        document_hash\\n        extra\\n        external_url\\n        category\\n        type\\n        visibility\\n        media_type\\n        animation_type\\n        tags\\n        media_size\\n        animation_size\\n        __typename\\n      }\\n      store {\\n        id\\n        is_external_contract\\n        __typename\\n      }\\n      __typename\\n    }\\n    royaltys {\\n      percent\\n      account\\n      __typename\\n    }\\n    splits {\\n      percent\\n      account\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"
      }`,
      "method": "POST"
    });
    const result = await resp.json();
    return result.data.token;
  }

  const subArraysTokens = await Promise.all(mainnetAccounts.map(fetchTokens));
  const tokens = subArraysTokens.flat();
  return tokens.map((x) => makeNftMetadata_Mintbase(x.thing, x.ownerId));
}

const getWidgetNft = (twitterAcc: string, nftId: string): Promise<INftMetadata | null> => {
  const getNftFromSource = {
    'ncd': fetchNfts_NCD(twitterAcc, nftId),
    'paras': async () => {
      try {
        const res = await fetch(`https://api-v2-mainnet.paras.id/token?contract_id=${nftId[2]}&token_id=${nftId[0]}`);
        const nftData = await res.json();
        const nft: PResult = nftData.data.results[0];
        return makeNftMetadata_Paras(nft);
      } catch (err) {
        console.log('Cannot parse metadata of the NFT from Paras', err);
        return null;
      }
    },
    'mintbase': async () => {
      try {
        const res = await fetch(`https://mintbase-mainnet.hasura.app/api/rest/things/${nftId[0]}`);
        const nftData = await res.json();
        const thing = nftData.thing[0];
        return makeNftMetadata_Mintbase(thing);
      } catch (err) {
        console.log('Cannot parse metadata of the NFT from Mintbase', err);
        return null;
      }
    }
  };
  return getNftFromSource[nftId[1]]();
};

export const getAvatarNft = async (twitterAcc?: string): Promise<INftMetadata | null> => {
  if (!twitterAcc) return null;
  const contr = await contractState;
  const avatarNftId = await contr.getNftId({ twitterAcc });
  return avatarNftId && getWidgetNft(twitterAcc, avatarNftId);
};

export const getAvatarBadgeNft = async (twitterAcc?: string): Promise<INftMetadata | null> => {
  if (!twitterAcc) return null;
  const contr = await contractState;
  const avatarBadgeNftId = await contr.getNftBadgeId({ twitterAcc });
  return avatarBadgeNftId && getWidgetNft(twitterAcc, avatarBadgeNftId);
};
